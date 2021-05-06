<template>
  <el-dialog
    :title="$t('添加已有字段')"
    :visible="visible"
    :modal-append-to-body="false"
    :close-on-click-modal="false"
    :before-close="handleBeforeClose"
    width="830px"
  >
    <div class="add-field-wrap">
      <div class="can-select-filed">
        <div class="title">{{ $t('可选字段') }}</div>
        <div class="add-field-scrollbar scrollbal-common">
          <div class="select-model">
            <h2 class="small-title">{{ $t('系统字段') }}</h2>
            <div class="field-box">
              <div
                v-for="(item, index) in systemAttrs"
                :key="index"
                class="field-item-box"
              >
                <el-checkbox
                  v-model="item.selected"
                  class="required-checkbox"
                  :disabled="!item.hideable"
                  @change="changeHandle(item)"
                ></el-checkbox>
                <div
                  class="field-name-title"
                  :class="{ 'field-name-disabled': !item.hideable }"
                  :title="item.fieldName"
                >
                  {{ item.fieldName }}
                </div>
              </div>
            </div>
          </div>
          <div class="select-model">
            <h2 class="small-title">
              {{ $t('自定义字段') }}
              <span
                v-if="
                  $authFunction(
                    'FUNC_COOP_PROJECT_USER_DEFINED_ATTR_CREATE',
                    3,
                    $getUrlParams().projectId,
                  )
                "
                class="add-field operatebtn link-common"
                @click="addFieldHandle"
                >+{{ $t('新增字段') }}</span
              >
            </h2>
            <div class="field-box">
              <div
                v-for="(item, index) in userDefinedAttrs"
                :key="index"
                class="field-item-box"
              >
                <el-checkbox
                  v-model="item.selected"
                  class="required-checkbox"
                  :disabled="!item.hideable"
                  @change="changeHandle(item)"
                ></el-checkbox>
                <div
                  class="field-name-title"
                  :class="{ 'field-name-disabled': !item.hideable }"
                  :title="item.fieldName"
                >
                  {{ item.fieldName }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="selected-filed">
        <div class="title">
          {{ $t('选定字段') }}
          <span class="title-desc">({{ $t('可拖拽排序') }})</span>
        </div>
        <div class="add-field-scrollbar scrollbal-common">
          <draggable
            v-model="selectionList"
            v-bind="dragOptions"
            @end="endEvent"
          >
            <div
              v-for="item in selectionList"
              :key="item.id"
              class="field-item"
            >
              <div class="field-name">
                <i class="iconfont icon-drag"></i>
                <span class="field-name" :title="item.fieldName">{{
                  item.fieldName
                }}</span>
              </div>
              <div class="close-opretion">
                <i
                  v-if="item.hideable"
                  class="el-icon-close close-icon"
                  @click="deleteHandle(item)"
                ></i>
                <i v-else class="el-icon-close close-icon icon-disabled"></i>
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </div>
    <div class="filed-dialog-opration">
      <el-button @click="handleBeforeClose">{{ $t('取消') }}</el-button>
      <el-button type="primary" @click="successHandle">{{
        $t('确定')
      }}</el-button>
    </div>
    <custom-field-dialog
      :dialog-info="dialogInfo"
      dialog-moudle-operate-status="add"
      :dialog-moudle-show-status="dialogMoudleShowStatus"
      :project-id="projectId"
      :work-item-type="workItemType"
      :tmpl-table-visible="false"
      @cancel="closeDialog"
      @success="operateCallback"
    ></custom-field-dialog>
  </el-dialog>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 模板添加已有字段
 * @desc
 * @author wangling
 * @date 2020/3/14
 */
import draggable from 'vuedraggable'
import cloneDeep from 'lodash/cloneDeep'
import { getWorkItemAllBasicAttrs } from '@/service/project/projectCommon'
import CustomFieldDialog from '@/views/setting/CustomField/CustomFieldDialog.vue'

export default {
  name: 'AddFieldDialog',
  components: {
    draggable,
    CustomFieldDialog,
  },

  mixins: [],
  props: {
    visible: Boolean,
    seletionField: {
      type: Array,
      required: true,
      desc: i18n.t('选中的字段'),
    },

    workItemType: {
      type: [Number, String],
      required: true,
      desc: '工作项类型，1-需求 2-任务 3-缺陷',
    },

    projectId: {
      type: [Number, String],
      required: true,
      desc: '工作项项目id',
    },
  },

  data() {
    return {
      dragOptions: {
        animation: 500,
      },

      selectionList: [],
      dialogInfo: {}, //新建字段
      dialogMoudleShowStatus: false, //新增字段弹窗状态
      originSystemAttrs: [], //原始系统字段
      originUserDefinedAttrs: [], //原始自定义字段
      systemAttrs: [], //系统字段列表
      userDefinedAttrs: [], //自定义字段列表
    }
  },
  computed: {},
  watch: {
    seletionField: {
      handler(newValue) {
        if (newValue) {
          this.initData()
        }
      },
      deep: true,
    },
  },

  created() {},
  mounted() {
    this.initData()
  },
  methods: {
    // 重置数据
    initData() {
      this.deepSeletionList()
      this.requestGetWorkItemAllBasicAttrs()
    },
    // 获取全部字段请求
    async requestGetWorkItemAllBasicAttrs(data) {
      const result = await getWorkItemAllBasicAttrs({
        projectId: this.projectId,
        workItemType: this.workItemType,
        forTmplManage: true,
      })

      if (result.status === 200) {
        this.originSystemAttrs = result.data.systemAttrs
        this.originUserDefinedAttrs = result.data.userDefinedAttrs
        this.deepCloneAllFieldAttrList()
        this.initOptionalField(data)
      }
    },
    // 初始化可选字段
    initOptionalField(data) {
      this.systemAttrs = this.optionalFieldValue(this.systemAttrs)
      this.userDefinedAttrs = this.optionalFieldValue(
        this.userDefinedAttrs,
        data,
      )
    },
    // 从选中数组拷贝值
    optionalFieldValue(fieldList, data) {
      return fieldList.map(item => {
        const existField = this.includeInArray(
          this.selectionList,
          'fieldName',
          item.fieldName,
        )

        if (existField) {
          return existField
          // 新建字段时,要选中并且在右侧还要显示
        } else if (
          (data && data.fieldName == item.fieldName) ||
          !item.hideable
        ) {
          item.selected = true
          this.selectionList.push(item)
          return item
        } else {
          item.selected = false
          return item
        }
      })
    },
    includeInArray(arr, attr, value) {
      return arr.find(item => {
        return item[attr] == value
      })
    },
    // 对象转换为array
    objectSwitchArray(object) {
      const fieldArr = []
      const keys = Object.keys(object)
      keys.forEach(item => {
        fieldArr.push(object[item])
      })
      return fieldArr
    },
    deepCloneAllFieldAttrList() {
      this.systemAttrs = this.objectSwitchArray(this.originSystemAttrs)
      this.userDefinedAttrs = this.objectSwitchArray(
        this.originUserDefinedAttrs,
      )
    },
    deepSeletionList() {
      this.selectionList = [...cloneDeep(this.seletionField)]
      this.selectionList.forEach(element => {
        element.selected = true
      })
    },
    // 弹窗关闭之前
    handleBeforeClose() {
      this.initData()
      this.$emit('handleBeforeClose')
    },
    // 复选框改变事件
    changeHandle(data) {
      if (data.selected) {
        // 选中增加一条数据
        this.selectionList.push(data)
      } else {
        this.seletionDelete(data)
      }
    },
    seletionDelete(data) {
      // 选中删除一条数据
      const deleteIndex = this.selectionList.findIndex(item => {
        return item.fieldName === data.fieldName
      })
      this.selectionList.splice(deleteIndex, 1)
    },
    // 改变复选框状态
    fieldCheckChange(data) {
      let currentOptionsList = data.userDefined
        ? this.userDefinedAttrs
        : this.systemAttrs
      currentOptionsList.forEach(item => {
        if (item.fieldName == data.fieldName) {
          item.selected = false
        }
        return item
      })
    },
    // 选定字段删除事件
    deleteHandle(data) {
      this.seletionDelete(data)
      // 可选字段状态更改
      this.fieldCheckChange(data)
    },
    endEvent(e) {
      console.log(e)
    },
    // 新增字段弹窗
    addFieldHandle() {
      this.dialogMoudleShowStatus = true
    },
    // 关闭新增字段弹窗
    closeDialog() {
      this.dialogMoudleShowStatus = false
    },
    // 新增字段成功回调函数
    operateCallback(data) {
      this.closeDialog()
      this.requestGetWorkItemAllBasicAttrs(data)
    },
    successHandle() {
      this.$emit('update:seletionField', this.selectionList)
      this.$emit('success')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/setting/workitem-variable.scss';
.add-field-wrap {
  display: flex;
}
.add-field-wrap .can-select-filed {
  width: 80%;
  border-right: 1px solid #ccc;
  height: 420px;
  .select-model {
    font-size: 12px;
    .required-checkbox {
      text-align: center;
    }
    /deep/ .required-checkbox .el-checkbox__inner {
      width: 14px;
      height: 14px;
      border-color: $can-selected-border-color;
    }
    .small-title {
      font-size: 14px;
      .add-field {
        color: $--color-primary;
        font-size: 12px;
      }
    }
    .field-box {
      display: flex;
      flex-wrap: wrap;
      .field-item-box {
        width: 25%;
        margin-bottom: 10px;
        box-sizing: border-box;
        padding-right: 20px;
        display: flex;
        align-items: center;
        .field-name-title {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          margin-left: 3px;
        }
        .field-name-disabled {
          color: #a6aaa7;
        }
      }
    }
  }
}
.add-field-wrap .selected-filed {
  width: 20%;
  height: 420px;
  padding-left: 5px;
  box-sizing: border-box;
}
.add-field-wrap .title {
  font-size: 14px;
  color: rgb(128, 145, 165);
  height: 30px;
}
.add-field-wrap .add-field-scrollbar {
  height: 390px;
  overflow-y: auto;
}
.add-field-wrap .title .title-desc {
  font-size: 12px;
  margin-left: 4px;
}
.add-field-wrap .field-item {
  display: flex;
  margin: 5px;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  .field-name {
    font-size: 12px;
    margin-right: 5px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .close-icon {
    font-size: 12px;
    cursor: pointer;
  }
}
.filed-dialog-opration {
  margin-top: 20px;
  text-align: center;
}
.icon-disabled {
  color: $disabled-font-color;
  cursor: default !important;
}
</style>
