<template>
  <div class="detail-template">
    <div class="display-basic-info">
      <div class="title">{{ $t('模板基本信息') }}</div>
      <div class="basic-info">
        <div class="info-group">
          <div class="info-title">{{ $t('模板名称') }}:</div>
          <div class="info-content" :title="tmplDetailInfo.name">
            {{ tmplDetailInfo.name }}
          </div>
          <div class="tips">(&lt;50{{ $t('字符') }})</div>
        </div>
        <div class="info-group">
          <div class="info-title">{{ $t('说明') }}:</div>
          <div class="info-content" :title="tmplDetailInfo.description">
            {{ tmplDetailInfo.description }}
          </div>
          <div class="tips">(&lt;50{{ $t('字符') }})</div>
        </div>
        <div class="info-group tips-info-group">
          <div class="info-title">{{ $t('标题') }}:</div>
          <div style="margin: 0 10px;" class="tips tips-box">
            {{ $t('创建') }}{{ workItemDisplayInfo
            }}{{ $t('标题会应用该内容') }},{{ $t('如将标题模板设置为') }}:*[{{
              $t('品牌')
            }}] [{{ $t('区域') }}]{{ workItemDisplayInfo
            }}{{ $t('标题') }}(&lt;50{{ $t('字符') }})
          </div>
        </div>
        <div class="info-group">
          <div class="info-title"></div>
          <div class="info-content" :title="tmplDetailInfo.title">
            {{ tmplDetailInfo.title }}
          </div>
        </div>
        <div class="info-group">
          <div class="info-title">{{ $t('描述内容') }}:</div>
          <div class="info-content" v-html="tmplDetailInfo.content"></div>
        </div>
      </div>
    </div>
    <div class="display-field-setting">
      <div class="title">{{ $t('显示字段配置') }}</div>
      <el-table :data="seletionField" row-key="id" class="field-drag-table">
        <el-table-column :label="$t('字段名')" prop="fieldName">
          <template slot-scope="scope">
            <div class="field-name-table">
              <i class="iconfont icon-drag" style="color:#666;"></i>
              <span class="field-name">{{ scope.row.fieldName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('是否必填')" width="100">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.required" disabled></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column :label="$t('操作')" width="80">
          <template>
            <i class="el-icon-close tmpl-btn-public"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title
 * @desc
 * @author wangling
 * @date
 */
import { getWorkItemTemplateDetail } from '@/service/project/projectCommon'
import { getWorkItemType } from './workItemTemplateUtils'

export default {
  name: 'TemplateDetail',
  components: {},
  mixins: [],
  props: {},
  data() {
    return {
      workItemDisplayInfo: '', //工作项页面展示信息
      tmplDetailInfo: {
        //工作项模板基本信息
        name: '',
        title: '',
        content: '',
        description: '',
      },

      seletionField: [
        //工作项模板选中表格信息
        {
          id: 1,
          required: true,
          fieldName: i18n.t('项目名称'),
          readonly: true,
        },

        {
          id: 2,
          required: true,
          fieldName: i18n.t('优先级'),
          readonly: true,
        },

        {
          id: 3,
          required: true,
          fieldName: i18n.t('模块'),
          readonly: false,
        },
      ],
    }
  },
  mounted() {
    this.workItemDisplayInfo = getWorkItemType(this.$route).workItemDisplayInfo
    this.requestGetWorkItemTemplateDetail()
  },
  methods: {
    // 查询工作项模板详细信息
    async requestGetWorkItemTemplateDetail() {
      const id = this.$route.query.tmplId
      const result = await getWorkItemTemplateDetail({
        id,
        projectId: this.$getUrlParams().projectId,
      })

      if (result.status === 200) {
        const { name, title, description, content, attrs } = result.data
        this.tmplDetailInfo = { name, title, description, content }
        this.seletionField = attrs
      }
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/style/setting/workitem-variable.scss';
.detail-template {
  display: flex;
  .display-basic-info {
    width: 50%;
    .info-group {
      display: flex;
      margin: 10px 0;
      min-height: 25px;
      .tips {
        font-size: 12px;
        color: #7c7979;
      }
      .info-title {
        flex-basis: 80px;
        width: 80px;
        text-align: right;
      }
      .info-content {
        flex: 1;
        box-sizing: border-box;
        margin: 0 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 3px 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .display-field-setting {
    width: 50%;
    padding-left: 20px;
    box-sizing: border-box;
  }
}
.tips-info-group {
  min-height: auto !important;
}
.tips-box {
  flex: 1;
  flex-basis: 0;
}
.field-name-table {
  display: flex;
}
.field-name {
  font-size: 12px;
  margin-right: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.tmpl-btn-public {
  font-size: 12px;
  color: $disabled-font-color;
}
/deep/.el-checkbox__input.is-disabled .el-checkbox__inner::after,
/deep/.el-checkbox__input.is-disabled .el-checkbox__inner {
  cursor: default;
}
</style>
