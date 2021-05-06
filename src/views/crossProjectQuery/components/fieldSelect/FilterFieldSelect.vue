<template>
  <el-dialog
    ref="moreFieldDialog"
    class="more-field-dialog"
    :title="$t('更多过滤条件')"
    :visible.sync="dialogVisible"
    width="1000px"
  >
    <div v-loading="loading" class="field-container">
      <div class="field-type-container">
        <div class="title">{{ $t('系统字段') }}</div>
        <div class="list">
          <el-row v-if="systemFields.length" :gutter="10">
            <el-col
              v-for="(item, index) in systemFields"
              :key="item.attrName + index"
              :span="6"
              :title="item.fieldName"
            >
              <el-checkbox-group v-model="checkKeys">
                <el-checkbox
                  :key="item.attrName"
                  :label="item.attrName"
                  :disabled="item.disabled"
                  @change="val => handleChange(val, item)"
                  >{{ item.fieldName }}</el-checkbox
                >
              </el-checkbox-group>
            </el-col>
          </el-row>
          <div v-else class="empty-data">{{ $t('暂无数据') }}</div>
        </div>
      </div>
      <!-- 暂时隐藏 -->
      <!-- <div class="field-type-container">
        <div class="title">{{ $t('需求自定义字段') }}</div>
        <div class="list">
          <el-row v-if="requirementCustomFields.length" :gutter="10">
            <el-col
              v-for="item in requirementCustomFields"
              :key="item.attrName + item.id"
              :span="6"
              :title="item.fieldName"
            >
              <el-checkbox-group v-model="checkKeys">
                <el-checkbox
                  :key="item.id"
                  :label="item.id"
                  @change="val => handleChange(val, item)"
                  >{{ item.fieldName }}</el-checkbox
                >
              </el-checkbox-group>
            </el-col>
          </el-row>
          <div v-else class="empty-data">{{ $t('暂无数据') }}</div>
        </div>
      </div>
      <div class="field-type-container">
        <div class="title">{{ $t('任务自定义字段') }}</div>
        <div class="list">
          <el-row v-if="taskCustomFields.length" :gutter="10">
            <el-col
              v-for="item in taskCustomFields"
              :key="item.attrName + item.id"
              :span="6"
              :title="item.fieldName"
              ><el-checkbox-group v-model="checkKeys">
                <el-checkbox
                  :key="item.id"
                  :label="item.id"
                  @change="val => handleChange(val, item)"
                  >{{ item.fieldName }}</el-checkbox
                >
              </el-checkbox-group>
            </el-col>
          </el-row>
          <div v-else class="empty-data">{{ $t('暂无数据') }}</div>
        </div>
      </div>
      <div class="field-type-container">
        <div class="title">{{ $t('缺陷自定义字段') }}</div>
        <div class="list">
          <el-row v-if="bugCustomFields.length" :gutter="10">
            <el-col
              v-for="item in bugCustomFields"
              :key="item.attrName + item.id"
              :span="6"
              :title="item.fieldName"
            >
              <el-checkbox-group v-model="checkKeys">
                <el-checkbox
                  :key="item.id"
                  :label="item.id"
                  @change="val => handleChange(val, item)"
                  >{{ item.fieldName }}</el-checkbox
                >
              </el-checkbox-group>
            </el-col>
          </el-row>
          <div v-else class="empty-data">{{ $t('暂无数据') }}</div>
        </div>
      </div> -->
    </div>
    <div slot="footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getAllAttrs } from '@/service/cross-project'
import { WORKITEMCONST } from '@/utils/constant'
import cloneDeep from 'lodash/cloneDeep'
import { statusList } from '../../constant'
import isEqual from 'lodash/isEqual'
// 过滤不必要的系统字段
const filterSystemFieldKeys = ['statusId', 'parentId']
export default {
  name: 'FilterFieldSelect',
  props: {
    show: {
      type: Boolean,
      desc: '是否显示',
    },
    projectIds: {
      type: Array,
      required: true,
      desc: '项目id',
    },
    defaultSelected: {
      type: Array,
      required: true,
      desc: '已选择的过滤器',
    },
    disableList: {
      type: Array,
      required: true,
      desc: '默认选择--不可更改',
    },
  },
  data() {
    return {
      allFieldList: [],
      systemFields: [],
      requirementCustomFields: [],
      taskCustomFields: [],
      bugCustomFields: [],
      loading: false,
      workItemNames: {
        1: this.$t('需求'),
        2: this.$t('任务'),
        3: this.$t('缺陷'),
      },
      checkKeys: [],
      selectFilters: [],
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.show
      },
      set(val) {
        this.$emit('update:show', val)
      },
    },
    selectedSet() {
      return new Set(this.checkKeys)
    },
  },
  watch: {
    projectIds: {
      handler: function(val, oldVal) {
        if (val.length && !isEqual(val, oldVal)) {
          this.$nextTick(() => {
            this.getAllAttrs(val)
          })
        }
      },
      immediate: true,
    },
    defaultSelected: {
      handler: function(val) {
        this.checkKeys = cloneDeep(val)
      },
      immediate: true,
    },
    show(val) {
      if (val) {
        this.$nextTick(() => {
          // 滚动到起始位置
          const dom = this.$refs.moreFieldDialog?.$el?.querySelector(
            '.el-dialog__body',
          )
          dom && (dom.scrollTop = 0)
        })
      }
    },
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm', this.selectFilters)
      this.dialogVisible = false
    },
    // 选择筛选字段值
    handleChange(val, item) {
      if (val) {
        this.selectFilters.push(item)
      } else {
        const index = this.checkKeys.findIndex(
          key => key === item.attrName || key === item.id,
        )
        index > -1 && this.checkKeys.splice(index, 1)
        const originIndex = this.selectFilters.findIndex(
          field =>
            (item.isUserDefined && item.id === field.id) ||
            (!item.isUserDefined && item.attrName === field.attrName),
        )

        if (originIndex > -1) {
          item.checked = val
          this.selectFilters.splice(originIndex, 1)
        }
      }
    },
    async getAllAttrs() {
      this.loading = true
      let res = {}
      const projectIds = !this.projectIds.length ? [-1] : this.projectIds
      try {
        res = await getAllAttrs(projectIds)
      } catch (error) {
        res.status = 0
      }

      if (res.status === 200 && res.data) {
        const disabledSet = new Set(this.disableList)
        const localSystemFilters = []
        const filterSystemFiltersSet = new Set(filterSystemFieldKeys)
        const systemFilters = [
          ...res.data.systemAttrs,
          ...cloneDeep(statusList),
        ]
        systemFilters.forEach(item => {
          if (!filterSystemFiltersSet.has(item.attrName)) {
            if (item.attrName === 'priority') {
              item.fieldName = '优先级/严重程度'
            }
            localSystemFilters.push({
              ...item,
              disabled: disabledSet.has(item.attrName),
              checked: this.selectedSet.has(item.attrName),
            })
          }
        })
        this.systemFields = localSystemFilters
        this.formatData(res.data.userDefinedAttrs)
      }

      this.loading = false
    },
    formatData(data) {
      const requirementNames = new Set()
      const taskNames = new Set()
      const bugNames = new Set()
      this.requirementCustomFields = []
      this.taskCustomFields = []
      this.bugCustomFields = []

      data.forEach(item => {
        const checked = this.selectedSet.has(item.attrName || item.id)
        if (item.workItemType === WORKITEMCONST.workItemTypeMap.requirement) {
          this.mergeSameTitle(
            this.requirementCustomFields,
            requirementNames,
            item,
            checked,
          )
        } else if (item.workItemType === WORKITEMCONST.workItemTypeMap.task) {
          this.mergeSameTitle(this.taskCustomFields, taskNames, item, checked)
        } else {
          this.mergeSameTitle(this.bugCustomFields, bugNames, item, checked)
        }
      })
    },
    /**
     * @param {Array} | dataList
     * @param {Set} | nameSet
     * @param {Object} | data
     * @param {Boolean} | checked
     */
    mergeSameTitle(dataList, nameSet, data, checked) {
      data.isUserDefined = true
      if (nameSet.has(data.fieldName)) {
        const sameFieldArr = dataList.filter(
          field => field.originalFieldName === data.fieldName,
        )

        if (sameFieldArr.length) {
          const original = sameFieldArr.find(
            item => item.attrValue === data.attrValue,
          )
          const mergeList = original?.mergeList || []
          if (!original) {
            dataList.push({
              ...data,
              checked,
              originalFieldName: data.fieldName,
              fieldName: `【${data.attrText}】${data.fieldName}`,
            })
            // 第一个改变名称
            const firstField = sameFieldArr[0]
            firstField.fieldName = `【${firstField.attrText}】${firstField.originalFieldName}`
          } else {
            // 合并
            !mergeList.length && mergeList.push(original)
            mergeList.push(data)
            original.isMerge = true
            original.mergeList = mergeList
          }
        }
      } else {
        dataList.push({ ...data, checked, originalFieldName: data.fieldName })
        nameSet.add(data.fieldName)
      }
    },
    clearSelect() {
      this.checkKeys = cloneDeep(this.defaultSelected)
      this.selectFilters = []
    },
  },
}
</script>

<style lang="scss" scoped>
.more-field-dialog {
  /deep/ .el-dialog__header {
    border-bottom: 1px solid #e5e5e5;
  }

  /deep/ .el-dialog__body {
    height: 480px;
    overflow-y: auto;
    overflow-x: hidden;
    @include scrollbal-common;
  }

  .empty-data {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $--color-text-secondary;
  }

  .field-container {
    .field-type-container {
      margin-bottom: 8px;
      .title {
        font-size: 12px;
        color: $--color-text-fine;
        margin-bottom: 10px;
      }

      .el-checkbox-group {
        width: 100%;
      }

      .el-checkbox {
        margin-left: 0;
        margin-bottom: 16px;
        width: 100%;
        /deep/ .el-checkbox__label {
          @include no-wrap;
          width: calc(100% - 24px);
        }
      }
    }
  }
}
</style>
