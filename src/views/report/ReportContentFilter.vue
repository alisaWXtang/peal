<template>
  <div>
    <el-dialog
      :title="$t('选择过滤器')"
      :visible.sync="filterInfo.show"
      width="460px"
    >
      <el-form>
        <el-form-item :label="$t('工作项类型') + '：'">
          <el-select
            v-model="workType"
            popper-append-to-body
            @change="workTypeChange"
          >
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('过滤器') + '：'">
          <el-select
            v-model="filterValue"
            :placeholder="$t('请选择')"
            popper-append-to-body
            multiple
            popper-class="report-group-select"
          >
            <el-option-group
              v-for="group in filterList"
              :key="group.filterName"
              :label="group.filterName"
            >
              <el-option
                v-for="item in group.options"
                :key="item.id"
                :label="item.filterName"
                :value="item.id"
              >
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <co-button @click="cancel">取 消</co-button>
        <el-button type="primary" @click="sureBtn">{{ $t('确定') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
import { customFilterList } from '@/service/custom-filter'

export default {
  name: 'ReportContentFilter',
  components: {},
  mixins: [],
  props: {
    filterInfo: {
      type: Object,
      required: false,
      desc: i18n.t('添加报告内容相关操作获得的信息'),
    },
  },

  data() {
    return {
      typeList: [
        { label: i18n.t('需求'), value: 1 },
        { label: i18n.t('任务'), value: 2 },
        { label: i18n.t('缺陷'), value: 3 },
      ],

      show: false,
      filterList: [],
      workType: 1,
      filterValue: [],
    }
  },
  computed: {},
  watch: {
    filterInfo: {
      handler(newVal) {
        if (newVal.choose) {
          this.filterValue = newVal.data.fiterIds
          this.workType = newVal.data.workItemType
        } else {
          this.filterValue = []
        }
      },
      deep: true,
    },
  },

  created() {},
  mounted() {
    if (this.filterInfo.data) {
      this.workType = this.filterInfo.data.workItemType
    }
    this.workTypeChange()
    if (this.filterInfo.data) {
      this.filterValue = this.filterInfo.data.fiterIds
    }
  },
  methods: {
    //工作类型切换
    workTypeChange() {
      this.filterValue = []
      customFilterList({
        projectId: this.$getUrlParams().projectId,
        type: this.workType,
      }).then(res => {
        if (res.status == 200) {
          //系统过滤器
          this.filterList = [
            {
              filterName: i18n.t('自定义过滤器'),
              options: [...res.data.userFilterList],
            },

            {
              filterName: i18n.t('系统过滤器'),
              options: [...res.data.systemFilterList],
            },
          ]
        }
      })
    },
    cancel() {
      this.filterInfo.show = false
    },
    //确定
    sureBtn() {
      this.filterInfo.show = false
      if (this.filterValue.length == 0) {
        this.$message(i18n.t('请选择过滤器'))
        return false
      }

      if (this.filterInfo.choose) {
        this.$emit('filterFun', {
          status: 'edit',
          index: this.filterInfo.index,
          data: {
            workTitle: i18n.t('过滤器'),
            fiterIds: this.filterValue,
            workItemType: this.workType,
          },
        })
      } else {
        this.$emit('filterFun', {
          status: 'add',
          data: {
            workTitle: i18n.t('过滤器'),
            fiterIds: this.filterValue,
            workItemType: this.workType,
          },
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.report-filter-mask {
  span {
    display: inline-block;
    width: 78px;
    text-align: end;
  }
}
</style>
