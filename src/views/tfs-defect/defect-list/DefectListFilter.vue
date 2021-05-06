<template>
  <div class="tfs-defect-list-filter">
    <el-form label-position="top">
      <div class="top-row header">
        <el-input
          v-model="filterInfo.keyword"
          class="keyword-form-item"
          clearable
          prefix-icon="co-icon-search"
          :placeholder="$t('输入ID、标题、项目代号搜索')"
          @keyup.native.enter="emitterDebounce"
          @clear="emitter"
        ></el-input>
        <div class="filter-right-container">
          <filter-dialog
            ref="filterDialog"
            class="more-filter-dialog"
            :title="$t('过滤')"
          >
            <el-link
              slot="reference"
              :class="selected.length > 0 ? 'filter-click' : ''"
              :underline="false"
              class="el-button-text icon iconfont icon-guolv1 hover-filter"
              >{{ $t('过滤') }}
            </el-link>
            <div slot="content" class="filter-container">
              <div class="filter-item-container">
                <!-- 已选项标签 -->
                <!--                <BaseTags-->
                <!--                  :tags="selected"-->
                <!--                  class="selected-tags-container"-->
                <!--                  @handleCloseTag="key => (filterInfo[key] = undefined)"-->
                <!--                />-->
                <template v-for="item in fields">
                  <el-form-item :key="item.attrName" :label="item.fieldName">
                    <OpSelect
                      v-if="item.componentName === 'OpSelect'"
                      v-model="filterInfo[item.attrName]"
                      v-bind="item.props"
                      popper-append-to-body
                      :alm-user-select="item.attrName === 'assignUsers'"
                      :alm-project-ids="item.attrName === 'projectIds'"
                    ></OpSelect>
                    <CustomDate
                      v-if="item.componentName === 'CustomDate'"
                      v-model="filterInfo[item.attrName]"
                      v-bind="item.props"
                      popper-class="statis-time__popper"
                      :picker-options="pickerOptions"
                    ></CustomDate>
                  </el-form-item>
                </template>
              </div>
              <div class="filter-footer-container">
                <el-button @click="onClearFilter">{{
                  $t('清空条件')
                }}</el-button>
                <el-button type="primary" @click="emitterDebounce">
                  {{ $t('过滤') }}
                </el-button>
              </div>
            </div>
          </filter-dialog>
          <co-divider direction="vertical"></co-divider>
          <co-link
            :underline="false"
            :loading="exportLoading"
            @click="exportData"
            ><i class="iconfont icon-daochu" />{{ $t('导出数据') }}</co-link
          >
        </div>
      </div>
    </el-form>
  </div>
</template>
<script>
/**
 * @title 过滤组件
 * @author wuqian
 * @date 2020.8.5
 * @update 2020.12.28 罗健源
 */
import { i18n } from '@/i18n'
import { mapState } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
// import OpSelect from '@/components/op-select'
// import CustomDate from '@/components/custom-date'

import OpSelect from './components/op-select'
import CustomDate from './components/custom-date'

// import BaseTags from '@/components/base-tags'
import FilterDialog from '@/components/filter-dialog'
import { tfsDefectMutation } from '@/store/mutation-types'
import { getUrlCurrentNodeKey } from '@/views/tfs-defect/common.js'
import { exportDefectList } from '@/service/tfsDefect'
import TfsDefctEventBus from '@/views/tfs-defect/eventBus.js'
import { pickerOptions, fromatRequestPayload } from '@/utils'

export default {
  name: 'DefectListFilter',
  components: { CustomDate, OpSelect, FilterDialog },
  props: {
    isLoad: {
      type: Boolean,
      desc: '过滤条件前置数据是否初始化完成',
    },
  },
  data() {
    return {
      pickerOptions: pickerOptions,
      filterInfo: {
        assignUsers: [],
        more: [],
      },
      selectorGroup: [],
      moreSelectorGroup: [],
      urlFilterInfo: {},
      exportLoading: false,
      assignUserFilter: '',
    }
  },
  computed: {
    ...mapState({
      projectCodes: state =>
        state.tfsDefect.projectCodes.map(item => {
          return {
            label: item,
            value: item,
          }
        }),
      filterGroup: state => state.tfsDefect.filterGroup,
      currentListTreeNodeKey: state => state.tfsCommon.currentListTreeNodeKey,
    }),
    // 全部过滤项
    fields() {
      return [...this.selectorGroup, ...this.moreSelectorGroup]
    },
    selected() {
      return this.fields
        .filter(item => {
          const val = this.filterInfo[item.attrName]
          return val && val[0] && val[0] !== 'all'
        })
        .map(({ selectType, attrName, fieldName, selectList }) => {
          const value = this.filterInfo[attrName]
          let label = []
          if (selectType === 'MULTI_CHOICE') {
            selectList.forEach(item => {
              if (value.indexOf(item.value) > -1) {
                label.push(item.label)
              }
            })
          } else if (selectType === 'DATE_ATTR') {
            label = value.join(` ${i18n.t('至')} `)
          } else {
            label = value
          }
          return {
            name: fieldName,
            label,
            value,
            type: attrName,
          }
        })
    },
  },
  watch: {
    // 监听 filterInfo.more 如果选项改变则需要隐藏对应的过滤条件
    'filterInfo.more'(val) {
      this.visibleMoreSelect(val)
    },
    isLoad(val) {
      if (val) {
        // filterGroup 创建完成后生成过滤条件组件
        this.generatorSelector(this.filterGroup)
      }
    },
    projectCodes: {
      handler(val) {
        const target = this.selectorGroup.find(
          item => item.attrName === 'projectIds',
        )
        if (target) {
          target.selectList = target.props.data = val
        } else {
          this.selectorGroup.push({
            attrName: 'projectIds',
            componentName: 'OpSelect',
            dataSource: 'projectIds',
            defaultShow: true,
            fieldName: '项目代号',
            hidden: false,
            props: {
              // canCancel: false,
              // canClearAll: true,
              data: val,
              multiple: true,
              selectedLabel: '项目代号',
            },
            selectList: val,
            selectType: 'MULTI_CHOICE',
            selectedValue: null,
          })
        }
      },
      deep: true,
    },
  },
  created() {
    this.emitterDebounce = debounce(
      () => {
        this.emitter()
      },
      300,
      { leading: true },
    )
    //触发更新
    TfsDefctEventBus.$on('defectChangeInit', productType => {
      this.filterInfo = {}
      //清空筛选数据
      this.$store.commit(tfsDefectMutation.CLEAR_TFS_DEFECT_FILTER)
      //更新url
      let ids = this.currentListTreeNodeKey.split(':')
      this.filterInfo.productType = productType
      if (ids[0]) this.filterInfo.teamId = ids[0]
      if (ids[1]) this.filterInfo.moduleId = ids[1]
      this.$updateRouteQuery(this.filterInfo, { replace: true })
      this.$emit('change', this.filterInfo)
    })
  },
  mounted() {
    this.parseUrlFilterInfo()
  },
  beforeDestroy() {
    TfsDefctEventBus.$off('defectChangeInit')
  },
  methods: {
    // 解析url上的过滤条件
    parseUrlFilterInfo() {
      this.urlFilterInfo = this.$parseRouteQuery()
      delete this.urlFilterInfo['projectId']
      delete this.urlFilterInfo['bugId']
      this.$store.commit(tfsDefectMutation.UPDATE_TFS_MODULES_LIST, {
        currentListTreeNodeKey: getUrlCurrentNodeKey(),
      })
    },
    // 初始化更多过滤条件
    initMoreSelectors() {
      const moreSelectKeys = this.filterInfo.more
      if (moreSelectKeys && this.moreSelectorGroup.length) {
        this.visibleMoreSelect(moreSelectKeys)
      }
    },
    // filterInfo 默认值
    setDefFilterInfo({ attrName, selectType, selectedValue, defaultShow }) {
      if (!selectedValue.length) return
      // 初始显示的更多过滤条件 defaultShow === false -> 更多过滤条件
      if (defaultShow === false) {
        this.filterInfo?.more?.push
          ? this.filterInfo.more.push(attrName)
          : (this.filterInfo.more = [attrName])
      }
      // 单选默认值为字符串 多选为数组
      this.filterInfo[attrName] =
        selectType === 'SINGLE_CHOICE'
          ? selectedValue[0].value
          : selectedValue.map(item => item.value)
    },
    // 由组件类型解析vue组件name
    getComponentName(type) {
      let name
      const ComponentNameMap = {
        OpSelect: ['MULTI_CHOICE', 'SINGLE_CHOICE'],
        CustomDate: ['DATE_ATTR'],
      }
      Object.entries(ComponentNameMap).forEach(([key, valueArr]) => {
        if (valueArr.includes(type)) {
          name = key
        }
      })
      return name
    },
    // 生成过滤条件组件配置
    createSelectorConfig(item) {
      // 组件名
      const componentName = this.getComponentName(item.selectType)
      // 是否更多过滤条件
      const isMore = !item.defaultShow
      const commonConfig = {
        ...item,
        hidden: isMore,
        componentName,
      }
      const configMap = {
        OpSelect: {
          ...commonConfig,
          props: {
            selectedLabel: item.fieldName,
            multiple: item.selectType === 'MULTI_CHOICE',
            data: item.selectList,
            // canClearAll: !isMore, // 更多过滤条件组件不显示清除按钮
            // canCancel: isMore, // 更多过滤条件组件显示取消按钮 - 取消则隐藏
          },
        },
        CustomDate: {
          ...commonConfig,
          props: {
            selectedLabel: item.fieldName,
            mode: 'text',
            type: 'datetimerange',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
          },
        },
      }
      return configMap[componentName]
    },
    generatorSelector(filterGroup = []) {
      const { selectorGroup, moreSelectorGroup } = this
      if (selectorGroup.length > 0 || moreSelectorGroup > 0) {
        return
      }
      filterGroup.forEach(item => {
        const { selectedValue, defaultShow } = item
        // 判断是否已经取了url的过滤参数 没有则取默认值
        if (isEmpty(this.urlFilterInfo) && selectedValue) {
          this.setDefFilterInfo(item)
        }
        const selectorConfig = this.createSelectorConfig(item)
        // defaultShow：true 表示默认显示的过滤条件 defaultShow：false 表示默认隐藏的更多过滤条件
        selectorConfig && defaultShow
          ? selectorGroup.push(selectorConfig)
          : moreSelectorGroup.push(selectorConfig)
      })
      //添加项目代号
      selectorGroup.push({
        attrName: 'projectIds',
        componentName: 'OpSelect',
        dataSource: 'projectIds',
        defaultShow: true,
        fieldName: '项目代号',
        hidden: false,
        props: {
          // canCancel: false,
          // canClearAll: true,
          data: [],
          multiple: true,
          selectedLabel: '项目代号',
        },
        selectList: [],
        selectType: 'MULTI_CHOICE',
        selectedValue: null,
      })
      if (!isEmpty(this.urlFilterInfo)) {
        this.filterInfo = { ...this.urlFilterInfo }
      }
      // 更多过滤条件选择器组件
      // this.appendSeletorGroup()
      // 创建 moreSelectorGroup 完成后 初始化默认显示的更多过滤条件
      this.initMoreSelectors()
      // init 事件 表示过滤条件和初始的 filterInfo 创建完成 可以查询列表
      this.emitter('init')
    },
    // 更多过滤条件选择器组件
    // appendSeletorGroup() {
    //   this.selectorGroup.push({
    //     attrName: 'more',
    //     componentName: 'OpSelect',
    //     props: {
    //       selectedLabel: '更多过滤条件',
    //       multiple: true,
    //       fixedLabel: true,
    //       canClearAll: false,
    //       showListSelectAll: false,
    //       showListClearAll: false,
    //       data: this.moreSelectorGroup.map(item => {
    //         return {
    //           label: item.fieldName,
    //           value: item.attrName,
    //         }
    //       }),
    //     },
    //   })
    // },
    // 过滤条件选项改变
    onChangeFilterOption(val, key) {
      // 改变更多过滤条件不发起请求
      if (key === 'more') return
      this.emitter()
    },
    // 清空条件
    onClearFilter() {
      const productType = this.filterInfo.productType
      this.filterInfo = { productType }
      this.$store.commit(tfsDefectMutation.CLEAR_TFS_DEFECT_FILTER)
      this.emitter('clear')
    },
    // 由key数组判断页面显示的过滤条件
    visibleMoreSelect(moreKeys = []) {
      this.moreSelectorGroup.forEach(item => {
        item.hidden = !moreKeys.includes(item.attrName) // hidden: true 表示不显示过滤条件
      })
    },
    // 隐藏过滤条件至更多过滤条件
    onCancelMoreFilter(key) {
      const index = this.filterInfo.more?.indexOf(key)
      if (index > -1) {
        this.filterInfo.more.splice(index, 1)
        delete this.filterInfo[key]
      }
      const filterInfo = fromatRequestPayload(this.filterInfo)
      this.$updateRouteQuery(filterInfo, { replace: true })
    },
    emitter(type) {
      if (type !== 'clear') {
        // 隐藏弹窗
        this.$refs.filterDialog && this.$refs.filterDialog.handleClose()
      }
      // 过滤列表时 url 附加过滤参数以便分享
      let filterInfo = fromatRequestPayload(this.filterInfo)
      if (this.currentListTreeNodeKey !== '-1') {
        const ids = this.currentListTreeNodeKey.split(':')
        if (ids[0]) {
          filterInfo.teamId = ids[0]
        }
        if (ids[1]) {
          filterInfo.moduleId = ids[1]
        }
      }
      this.$updateRouteQuery(filterInfo, { replace: true })
      this.$emit('change', filterInfo)
    },
    // 导出数据
    exportData() {
      this.exportLoading = true
      // 过滤列表时 url 附加过滤参数以便分享
      let filterInfo = fromatRequestPayload(this.filterInfo)
      if (this.currentListTreeNodeKey !== '-1') {
        const ids = this.currentListTreeNodeKey.split(':')
        if (ids[0]) {
          filterInfo.teamId = ids[0]
        }
        if (ids[1]) {
          filterInfo.moduleId = ids[1]
        }
      }

      exportDefectList({ ...filterInfo, pageInfo: {} })
        .then(res => {
          const data = URL.createObjectURL(res.data)
          const a = document.createElement('a')
          a.href = data
          a.hidden = true
          a.download = '缺陷列表数据.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        })
        .finally(() => {
          this.exportLoading = false
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.tfs-defect-list-filter {
  .keyword-form-item {
    width: 280px;

    /deep/ .el-input__inner {
      padding: 0 30px;
    }
  }

  .filter-right-container {
    display: flex;
    align-items: center;

    /deep/ .el-divider--vertical {
      margin: 0 16px;
    }

    .el-link {
      line-height: 32px;
      font-size: 14px;

      .iconfont {
        margin-right: 3px;
        color: $--color-text-secondary;
      }

      &:hover .iconfont {
        color: $--color-primary;
      }
    }

    .more-filter-dialog /deep/ {
      .header-wrap {
        padding: 0 24px;
      }

      .icon-guolv1 {
        &::before {
          margin-right: 3px;
          color: $--color-text-secondary;
        }

        &:hover::before {
          color: $--color-primary;
        }
      }

      .filter-click::before {
        color: $--color-primary;
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

            // .selected-tags-container {
            //   padding: 0 24px;
            // }

            .el-form-item {
              margin-bottom: 16px;

              .el-date-editor.el-input__inner {
                position: static;
                width: 100%;
                padding: 0 5px;

                .el-range-input {
                  padding: 0;
                }
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

  .middle-row {
    min-height: 35px;
  }
  .top-row .el-form-item--mini.el-form-item {
    margin-bottom: 10px;
  }
  .filter-row .el-form-item--mini.el-form-item {
    margin-bottom: 5px;
  }
  /deep/ .filter-option-select .el-select-dropdown__wrap {
    max-height: 470px;
  }

  /deep/ .el-range-editor {
    width: 100%;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
