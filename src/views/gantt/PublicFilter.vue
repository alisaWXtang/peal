<template>
  <div class="filter-content">
    <div class="filter-box">
      <ul class="gantt__filter--left">
        <li v-for="form in topFilterList" :key="form.attrName">
          <ellipsis-block
            v-if="form.fieldName"
            class="workitem-basic-info-item-label ellipsis-pure"
            :value="form.fieldName"
          ></ellipsis-block>
          <div class="filter-item">
            <form-item
              v-model="form.value"
              class="form-item"
              :type="form.attrValue"
              v-bind="form.attrs"
              :select-list="form.selectList"
              :filter-field="form.filterField"
              :popper-append-to-body="form.popperAppendToBody"
              :is-clearable="form.isClearable"
              :is-assign-user="form.isAssignUser"
              @focus="getSelectList(form)"
              @change="
                value => {
                  handleChange(form, value)
                }
              "
            ></form-item>
          </div>
        </li>
        <!-- <li v-if="moreFilter">
          <co-link :underline="false" @click="openMoreFilter"
            >{{ moreFilterText
            }}<i
              class="el-icon-arrow-down el-icon--right"
              :class="{ rotate: showMoreFilter }"
            ></i
          ></co-link>
        </li> -->
      </ul>
      <div class="gantt__filter--right">
        <filter-dialog
          ref="filterDialog"
          title="高级筛选"
          class="more-filter-dialog"
          right-distance="24"
          dis-y="24"
          :filter-elements="['gantt-filter-field-dialog']"
        >
          <co-link slot="reference" type="primary" :underline="false"
            >{{ moreFilterText
            }}<i
              class="el-icon-arrow-down el-icon--right"
              :class="{ rotate: showMoreFilter }"
            ></i
          ></co-link>
          <div slot="content" class="filter-container">
            <div class="filter-item-container">
              <div
                v-for="form in innerFilterList"
                :key="form.attrName"
                class="filter-item"
              >
                <div class="filter-item-label">{{ form.fieldName }}</div>
                <form-item
                  v-model="form.value"
                  class="form-item"
                  :type="form.attrValue"
                  v-bind="form.attrs"
                  :select-list="form.selectList"
                  :filter-field="form.filterField"
                  :popper-append-to-body="form.popperAppendToBody"
                  :is-clearable="form.isClearable"
                  :is-assign-user="form.isAssignUser"
                  @focus="getSelectList(form)"
                ></form-item>
              </div>
              <co-link
                :underline="false"
                type="primary"
                @click="pushFilterField"
                ><i class="el-icon-plus el-icon--left"></i>增加过滤字段</co-link
              >
            </div>
            <div class="filter-footer-container">
              <el-button type="primary" @click="handleFilter">
                过滤
              </el-button>
            </div>
          </div>
          <!-- <el-link
            slot="reference"
            :class="isFilter ? 'filter-click' : ''"
            :underline="false"
            class="el-button-text icon iconfont icon-guolv1"
            >{{ $t('过滤') }}
          </el-link> -->
          <!-- <HeaderBaseFilter
            ref="headerBaseFilter"
            slot="content"
            :is-card-page-type="isCardPageType"
            :category-data="categoryData"
            :handle-catgory-change="handleCatgoryChange"
            owner="requirement"
            @changeFilterState="
              val => {
                this.isFilter = val
              }
            "
            @filterSaveClick="filterSaveClick"
            @onClearFilter="onClearFilter"
          >
          </HeaderBaseFilter> -->
        </filter-dialog>
        <slot name="filterRight"></slot>
      </div>
      <!-- <div v-show="showMoreFilter" class="filter__wrap">
        <ul v-if="moreFilter" class="filter__wrap--left">
          <li v-for="form in innerFilterList" :key="form.attrName">
            <ellipsis-block
              v-if="form.fieldName"
              class="workitem-basic-info-item-label ellipsis-pure"
              :value="form.fieldName"
            ></ellipsis-block>
            <div class="filter-item">
              <form-item
                v-model="form.value"
                class="form-item"
                :type="form.attrValue"
                v-bind="form.attrs"
                :select-list="form.selectList"
                :filter-field="form.filterField"
                :popper-append-to-body="form.popperAppendToBody"
                :is-clearable="form.isClearable"
                :is-assign-user="form.isAssignUser"
                @focus="getSelectList(form)"
              ></form-item>
            </div>
          </li>
          <li v-if="allowAddField">
            <co-link :underline="false" type="primary" @click="pushFilterField"
              ><i class="el-icon-plus el-icon--left"></i>增加过滤字段</co-link
            >
          </li>
        </ul>
        <div class="filter__wrap--right">
          <i
            class="filter--close el-icon-close"
            @click="showMoreFilter = false"
          ></i>
          <co-button type="primary" @click="handleFilter">过滤</co-button>
        </div>
      </div> -->
    </div>
    <!-- <div v-if="showCondition" class="gantt__condition">
      <div v-if="conditionList.length">
        <el-tag
          v-for="item in conditionList"
          :key="item.attrName"
          effect="plain"
          closable
          size="medium"
          :title="conditionTextFormat(item)"
          @close="deleteCondition(item)"
          >{{ item.label }}：{{ conditionTextFormat(item) }}</el-tag
        >
      </div>
    </div> -->
  </div>
</template>
<script>
/**
 * 公用过滤器
 */
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import FormItem from '@/components/typed-form-item'
import FilterDialog from '@/components/filter-dialog'
export default {
  name: 'PublicFilter',
  components: {
    FormItem,
    FilterDialog,
  },
  props: {
    filterList: {
      type: Array,
      default: () => {
        return []
      },
      desc: '过滤器数据列表',
    },
    moreFilter: {
      type: Boolean,
      default: true,
      desc: '是否展示更多过滤条件',
    },
    moreFilterText: {
      type: String,
      default: '高级筛选',
      desc: '展示更多过滤条件的文字',
    },
    moreFilterList: {
      type: Array,
      default: () => {
        return []
      },
      desc: '展开更多过滤器数据列表',
    },
    allowAddField: {
      type: Boolean,
      default: true,
      desc: '是否允许添加过滤字段',
    },
    showCondition: {
      type: Boolean,
      default: true,
      desc: '是否展示过滤器筛选条件',
    },
    cacheFilterKey: {
      type: String,
      default: '',
      desc: '过滤器缓存的key值，无值表示不缓存',
    },
    actionName: {
      type: String,
      default: '',
      desc: '获取选择项的请求',
    },
  },
  data() {
    return {
      topFilterList: [],
      innerFilterList: [],
      showMoreFilter: false, // 筛选显示
      conditionList: [],
      workItemType: [],
      currentModelValue: [],
    }
  },
  computed: {
    totalOriginList() {
      return [...this.filterList, ...this.moreFilterList]
    },
    totalList() {
      return [...this.topFilterList, ...this.innerFilterList]
    },
  },
  watch: {
    filterList: {
      handler: function(val) {
        this.topFilterList = cloneDeep(val)
      },
      deep: true,
      immediate: true,
    },
    moreFilterList: {
      handler: function(val) {
        this.innerFilterList = cloneDeep(val)
        if (this.cacheFilterKey && val && val.length) {
          let cache = localStorage.getItem(this.cacheFilterKey)
          let cacheObj = cache ? JSON.parse(cache) : {}
          cacheObj.fields = val.map(i => i.attrName)
          localStorage.setItem(this.cacheFilterKey, JSON.stringify(cacheObj))
        }
      },
      deep: true,
      immediate: true,
    },
    totalOriginList: {
      handler: function(val) {
        if (val && val.length) {
          this.updateModel()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  created() {},
  mounted() {},
  methods: {
    async handleChange(field, value) {
      let target = this.totalList.find(i => i.attrName === field.attrName)
      target.value = value
      await this.changeProjectLinkage(
        field.attrName,
        value.indexOf('all') > -1 ? [] : value,
      )
      this.updateModel()
    },
    // 更新 v-model 值
    updateModel() {
      let updateCondition = this.getModelObj()
      this.conditionList = this.conditionListForamt(updateCondition) || []
      this.$emit('submitSearch', updateCondition)
    },
    // 获取当前表单数据 - 注意区分固有字段和自定义字段
    getModelObj() {
      let condition = []
      for (let i = 0, len = this.totalList.length; i < len; i++) {
        let { attrName, fieldName, value, selectList, attrs } = this.totalList[
          i
        ]
        if (attrName === 'expectedSolutionPhase') {
          this.totalList[i].attrName = 'expectedSolutionPhases'
        }
        if (attrName === 'businessEnd') {
          this.totalList[i].attrName = 'businessEnds'
        }
        // 过滤掉数组空值
        Array.isArray(value) && (value = value.filter(m => m))
        if (attrs.group) {
          selectList = [].concat.apply(
            [],
            selectList.map(m => m.children),
          )
        }
        let temp = {
          key: attrName,
          label: fieldName,
          value,
          presetList: selectList?.length
            ? selectList.filter(j => new Set(value).has(j.key))
            : [],
        }
        condition.push(temp)
      }
      if (this.cacheFilterKey) {
        let cache = localStorage.getItem(this.cacheFilterKey)
        let cacheObj = cache ? JSON.parse(cache) : {}
        cacheObj.condition = condition
        localStorage.setItem(this.cacheFilterKey, JSON.stringify(cacheObj))
      }
      this.currentModelValue = condition
      return condition
    },
    // 获取select的下拉框的值
    getSelectList: debounce(async function(item) {
      let total = this.totalList
      let projectIds = this.currentModelValue.find(i => i.key === 'projectIds')
        .value
      projectIds = ['all', 'undefined'].includes(projectIds + '')
        ? []
        : projectIds
      if (item.formType === 'SELECT') {
        let res = await this.$store.dispatch(this.actionName, {
          projectIds,
          attrName: item.attrName,
          dataSource: item.dataSource,
        })
        if (res.status === 200) {
          let resultData = res.data
          for (let i = 0, len = total.length; i < len; i++) {
            if (total[i].attrName === item.attrName) {
              let selectList = cloneDeep(total[i].selectList)
              total[i].attrs.loading = false
              if (total[i].attrs.group) {
                selectList = [].concat.apply(
                  [],
                  selectList.map(m => m.children),
                )
              }
              let diffList = this.differenceSet(selectList, resultData)
              total[i].selectList = [...resultData, ...diffList].map(item => {
                if (
                  ['assignUsers', 'createUsers', 'relevantUsers'].includes(
                    total[i].attrName,
                  )
                ) {
                  return {
                    ...item,
                    key: item.userId,
                    value: `${item.userName}(${item.userId})`,
                  }
                } else if (
                  ['projectIds', 'sprintIds'].includes(total[i].attrName)
                ) {
                  return {
                    ...item,
                    key: item.id,
                    value: item.name,
                  }
                } else if (['defectStatusIds'].includes(total[i].attrName)) {
                  return {
                    ...item,
                    key: item.statusId,
                    value: item.statusName,
                  }
                } else if (['prioritys'].includes(total[i].attrName)) {
                  return {
                    ...item,
                    key: item.priority,
                    value: item.literal,
                  }
                } else {
                  return {
                    ...item,
                    key: item.value,
                    value: item.label,
                  }
                }
              })
              if (total[i].attrs.group) {
                total[i].selectList = this.groupProject(
                  total[i].selectList,
                  total[i].attrName,
                )
              }
              break
            }
          }
        }
      }
    }, 500),
    // 修改项目联动-迭代，相关人，处理人，创建人，需求分类
    async changeProjectLinkage(fieldName, projectIds) {
      if (fieldName === 'projectIds') {
        for (let i = 0, len = this.totalList.length; i < len; i++) {
          let { attrName, dataSource } = this.totalList[i]
          if (
            [
              'assignUsers',
              'createUsers',
              'relevantUsers',
              'categoryIds',
            ].includes(attrName)
          ) {
            this.totalList[i].value = ['all']
          }
          if (attrName === 'sprintIds') {
            let result = await this.$store.dispatch(this.actionName, {
              projectIds,
              attrName,
              dataSource,
            })
            if (result.status === 200) {
              let list =
                result?.data
                  ?.filter(m => m.status === 1)
                  .map(k => {
                    return {
                      ...k,
                      key: k.id,
                      value: k.name,
                    }
                  }) || []
              this.totalList[i].selectList = this.groupProject(list, attrName)
              this.totalList[i].value = list.length
                ? list.map(n => n.id)
                : ['all']
            }
          }
        }
      }
    },
    // 分组
    groupProject(list, type) {
      if (!list.length) {
        return []
      }
      let result = [
        {
          label: type === 'projectIds' ? '进行中' : '未归档',
          children: [],
        },
        {
          label: type === 'projectIds' ? '已结束' : '已归档',
          children: [],
        },
      ]
      list.forEach(item => {
        if (
          (type === 'projectIds' && item.completed) ||
          (type !== 'projectIds' && item.status === 2)
        ) {
          result[1].children.push(item)
        } else {
          result[0].children.push(item)
        }
      })
      return result
    },
    // 展开筛选
    openMoreFilter() {
      this.showMoreFilter = !this.showMoreFilter
    },
    // 过滤
    handleFilter() {
      this.updateModel()
      // this.showMoreFilter = false
      this.$refs.filterDialog.handleClose()
    },
    // 增加过滤字段
    pushFilterField() {
      this.$emit('addField')
    },
    // 删除过滤条件
    async deleteCondition(tag) {
      let target = this.totalList.find(i => i.attrName === tag.key)
      if (target.formType === 'SELECT') {
        target.value = ['all']
      } else if (target.formType === 'CHECKBOX') {
        target.value = []
      } else {
        target.value = ''
      }
      this.conditionList.splice(this.conditionList.indexOf(tag), 1)
      await this.changeProjectLinkage(target.attrName, [])
      this.updateModel()
    },
    conditionListForamt(list) {
      let result = []
      list.forEach(item => {
        if (!['projectIds', 'assignUsers', 'title'].includes(item.key)) {
          let temp = item.value + ''
          if (temp.trim() && !['undefined', 'null', 'all'].includes(temp)) {
            result.push(item)
          }
        }
      })
      return result
    },
    // 过滤全部不显示在筛选条件里
    conditionTextFormat(obj) {
      const { presetList, value } = obj || {}
      let result = ''
      if (presetList?.length) {
        result = presetList.map(j => j.value).join(',')
      } else if (Array.isArray(value)) {
        result = value.join(' 至 ')
      } else {
        result = value
      }
      return result
    },
    /**
     * 2 个数组求差集
     */
    differenceSet(target, origin) {
      !target && (target = [])

      return [...target]
        .filter(x =>
          [...origin].every(y => y.id !== x.id || y.userId !== x.userId),
        )
        .map(item => ({
          ...item,
          noHeight: true,
        }))
    },
  },
}
</script>
<style lang="scss" scoped>
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;
}
.filter-content {
  .filter-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 73px;
    padding: 0 24px;
    background-color: #fff;

    .gantt__filter--left,
    .gantt__filter--right {
      display: flex;
      align-items: center;
    }
    .gantt__filter--left {
      flex-wrap: wrap;
      flex: 1;
      .workitem-basic-info-item-label {
        height: 28px;
        line-height: 28px;
        display: inline-block;
        min-width: 20px;
        max-width: 80px;
        overflow: hidden;
        padding-right: 6px;
        /deep/ .text-pointer {
          cursor: unset;
        }
      }
      & > li {
        display: flex;
        align-items: center;
        margin-right: 10px;

        .filter-item {
          min-width: 260px;
          /deep/ .el-icon-search {
            cursor: pointer;
          }
        }
      }
      .el-icon-arrow-down {
        transition: all 0.2s ease-in-out;
      }
      .rotate {
        transform: rotate(180deg);
      }
      /deep/ .select-wrap {
        width: 100%;
        .select-title {
          height: 32px;
          border-radius: 2px;
          border: 1px solid #dde5ef;
        }
      }
    }
    .gantt__filter--right {
      flex-shrink: 0;

      /deep/ .el-link--inner {
        font-size: 14px;
      }

      .more-filter-dialog /deep/ {
        .header-wrap {
          padding: 0 24px;
        }
        .content-dialog-box {
          padding: 16px 0 0 0;

          .filter-container {
            display: flex;
            flex-direction: column;
            height: calc(100% - 30px);
            padding-top: 20px;
            box-sizing: border-box;

            .filter-item-container {
              flex: 1;
              padding: 0 24px 10px;
              overflow: auto;

              .filter-item {
                margin-bottom: 20px;

                .filter-item-label {
                  font-size: 14px;
                  margin-bottom: 5px;
                }

                .el-date-editor--daterange.el-input__inner {
                  position: static;
                  width: 100%;
                }
              }
            }

            .filter-footer-container {
              height: 60px;
              line-height: 60px;
              text-align: right;
              padding: 0 24px;
            }
          }
        }
      }
    }
  }
  .form-item {
    width: 100%;
  }
  /deep/ .el-tag.el-tag--info {
    // color: #606266;
    // border-color: #dde5ef;
    background: #f1f4f9;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    line-height: 22px;

    .el-tag__close {
      // color: #606266;
      border-radius: 50%;
      vertical-align: middle;

      // &:hover {
      //   background-color: $--color-primary;
      //   color: #fff;
      // }
    }
  }
  // .filter__wrap {
  //   position: absolute;
  //   width: 100%;
  //   top: 100%;
  //   left: 0;
  //   z-index: 9;
  //   display: flex;
  //   background-color: #f1f4f9;
  //   box-shadow: 0px 10px 10px 0px rgba(0, 0, 0, 0.2);
  //   border-radius: 4px;
  //   .filter__wrap--left {
  //     flex: 1;
  //     display: flex;
  //     flex-wrap: wrap;
  //     padding: 20px 0 0 20px;
  //     li {
  //       display: flex;
  //       width: 450px;
  //       align-items: center;
  //       margin-bottom: 20px;
  //       .workitem-basic-info-item-label {
  //         flex-shrink: 0;
  //         height: 28px;
  //         line-height: 28px;
  //         display: inline-block;
  //         width: 85px;
  //         overflow: hidden;
  //         padding-right: 5px;
  //         /deep/ .text-pointer {
  //           cursor: unset;
  //         }
  //       }
  //       .filter-item {
  //         width: 260px;
  //         min-height: 28px;
  //         position: relative;
  //         display: flex;
  //         align-items: center;
  //         /deep/ .el-date-editor--daterange.el-input__inner {
  //           min-width: 100%;
  //         }
  //         /deep/ .el-date-editor {
  //           position: static !important;
  //         }
  //       }
  //     }
  //   }
  //   .filter__wrap--right {
  //     padding: 20px 20px 20px 0;
  //     display: flex;
  //     flex-shrink: 0;
  //     width: 200px;
  //     justify-content: flex-end;
  //     align-items: flex-end;
  //     position: relative;
  //     .filter--close {
  //       position: absolute;
  //       top: 10px;
  //       right: 10px;
  //       z-index: 9;
  //       cursor: pointer;
  //     }
  //   }
  // }
  .gantt__condition {
    > div {
      padding-bottom: 10px;
    }
    /deep/ .el-tag {
      max-width: 320px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
      padding-right: 20px;
      margin-right: 8px;
      &.el-tag--plain {
        color: #999;
        border-color: #e5e5e5;
      }
      .el-tag__close {
        position: absolute;
        top: 6px;
        right: 4px;
        color: #999;
        font-size: 14px;
        &:hover {
          color: #fff;
          background-color: #aaa;
        }
      }
    }
  }
  /deep/ .el-scrollbar {
    max-width: 500px;
  }
  /deep/ .el-select-dropdown__wrap {
    max-height: 450px;
    .select-scroll {
      height: auto;
      max-height: 400px;
    }
  }
}

.filter-content /deep/ {
  .coustom_input .el-input__inner {
    padding-left: 28px;
  }

  .gantt__filter .el-select__tags-text {
    max-width: 105px;
  }
  .filter__wrap .el-select__tags-text {
    max-width: 145px;
  }
}
</style>
