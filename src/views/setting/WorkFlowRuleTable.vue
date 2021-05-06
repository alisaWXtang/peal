<template>
  <div class="rule-container">
    <div class="rule-header">
      <span>{{ $t('流转权限') }}/{{ $t('流转自定义规则') }}</span>
    </div>
    <el-table
      :data="transfers"
      style="width: 100%"
      :border="transfers.length !== 0"
    >
      <el-table-column
        prop="def.name"
        :label="$t('流转目标状态')"
        width="180"
      ></el-table-column>
      <el-table-column :label="$t('流转权限')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <!-- <div class="flow-power"> -->
          <span v-if="isShowRolesFont(scope.row.defaultRule.authority)">{{
            $t('只有')
          }}</span>
          <em>{{ getRoleName(scope.row.defaultRule.authority) }}</em>
          <span>{{ $t('能将状态置为') }}</span>
          <em>{{ scope.row.def.name }}</em>
          <!-- </div> -->
        </template>
      </el-table-column>

      <el-table-column :label="$t('状态流转附加字段')" show-overflow-tooltip>
        <template slot="header">
          <span>{{ $t('状态流转附加字段') }}</span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              <p>
                {{ $t('设置状态流转附加字段后') }}，{{
                  $t('附加字段会在流转弹窗里展示')
                }}，{{ $t('供用户填写') }}。
              </p>
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <div
            v-for="(item, index) in scope.row.defaultRule.fields.value.fields"
            :key="index"
            class="attach"
          >
            <span>{{ item.fieldName }}</span>
            <span class="default-value"
              >{{ $t('默认值为') }}[{{
                item.defaultValueType
                  | attachDefaultType(item.defaultValueTypeOptions)
              }}]</span
            >
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('附加字段是否必填')" width="180">
        <template slot-scope="scope">
          <div
            v-for="(item, index) in scope.row.defaultRule.fields.value.fields"
            :key="index"
          >
            {{ item.required ? $t('是') : $t('否') }}
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('操作')" width="180">
        <template slot-scope="scope">
          <div id="editor">
            <el-button
              v-if="
                $authFunction('FUNC_COOP_STATUS_CONFIG_UPDATE', 3, projectId)
              "
              type="text"
              size="small"
              @click="editorRule(scope.row)"
              >{{ $t('编辑') }}</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 状态流转自定义规则 table
 * @desc
 * @author wangling
 * @date 2019.10.15
 */
export default {
  name: 'WorkFlowRuleTable',
  components: {},

  filters: {
    //  处理人以及评论默认值类型,
    attachDefaultType(type, typeOptions) {
      if (typeOptions) {
        let currentType = typeOptions.filter(item => {
          if (item.value == type) {
            return item.label
          }
        })
        return currentType[0]?.label
      }
      return i18n.t('无')
    },
  },
  mixins: [],
  props: {
    projectId: {
      type: [String, Number],
      required: true,
      desc: '项目 id',
    },

    workItemType: {
      type: [String, Number],
      required: true,
      desc: '当前工作流类型',
    },

    transfers: {
      type: Array,
      required: true,
      desc: '工作流状态流转',
    },

    roles: {
      type: Array,
      required: true,
      desc: '工作流角色权限列表',
    },

    userFields: {
      type: Array,
      required: true,
      desc: '工作流所有人员字段',
    },
  },

  data() {
    return {}
  },
  computed: {
    // 流转权限渲染
    getRoleName() {
      return function(authorityRole) {
        let rolesArr = JSON.stringify(authorityRole.value.roles)
        let fieldsArr = JSON.stringify(authorityRole.value.fields)
        let currentRole = authorityRole.value.roles
        let currentUser = authorityRole.value.fields

        let rolesName = []
        let fieldsName = []
        // 角色和用戶都是空數組時，所有人有权限
        if (rolesArr === '[]' && fieldsArr === '[]') {
          return i18n.t('所有项目成员')
        }
        // 当角色和用户全都选择时，所有人又权限
        if (rolesArr !== '[]' && fieldsArr !== '[]') {
          let rolesIsQual = this.isEqual(this.roles, currentRole, 'groupId')
          let userIsQual = this.isEqual(
            this.userFields,
            currentUser,
            'attrName',
          )

          if (rolesIsQual && userIsQual) {
            return i18n.t('所有项目成员')
          }
        }
        // 把角色渲染成中文，添加到數組rolesName
        if (rolesArr !== '[]') {
          authorityRole.value.roles.forEach(item => {
            this.roles.forEach(item1 => {
              if (item1.groupId == item) {
                rolesName.push(item1.groupName)
              }
            })
          })
        }
        // 把用戶渲染成中文，添加到數組fieldsName
        if (fieldsArr !== '[]') {
          authorityRole.value.fields.forEach(item => {
            this.userFields.forEach(item1 => {
              if (item1.attrName == item) {
                fieldsName.push(item1.fieldName)
              }
            })
          })
        }
        return rolesName.concat(fieldsName).join()
      }
    },
    // 是否显示只有这个两个字
    isShowRolesFont() {
      return function(authorityRole) {
        let rolesArr = JSON.stringify(authorityRole.value.roles)
        let fieldsArr = JSON.stringify(authorityRole.value.fields)
        let rolesIsQual = this.isEqual(
          this.roles,
          authorityRole.value.roles,
          'groupId',
        )

        let userIsQual = this.isEqual(
          this.userFields,
          authorityRole.value.fields,
          'attrName',
        )

        if (rolesArr === '[]' && fieldsArr === '[]') {
          return false
        }
        if (rolesIsQual && userIsQual) {
          return false
        }
        return true
      }
    },
  },

  // watch: {
  //   transfers: {
  //     handler(newValue) {},
  //   },
  // },

  created() {},
  mounted() {},
  methods: {
    editorRule(row) {
      this.$emit('editorRule', row)
    },
    // 判断当前数组是否全部选中，fieldName是角色和用户的属性不同
    isEqual(arr1 = [], arr2 = [], fieldName) {
      // NOSONAR
      return arr1.every(item => {
        return arr2.indexOf(item[fieldName]) !== -1
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.rule-container {
  margin-top: 20px;
}
.rule-header {
  margin-bottom: 20px;
}
.rule-container em {
  font-weight: 700;
  font-style: normal;
}
.attach > .default-value {
  color: #bfbfbf;
}
</style>
