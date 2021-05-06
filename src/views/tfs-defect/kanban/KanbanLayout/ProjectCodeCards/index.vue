<template>
  <div class="tfs-project-code-cards">
    <template v-for="(card, index) in data">
      <CardNode
        :key="index"
        :data="card"
        @blocked-problem-click="openDialogTable"
        @diClick="handleDiClick"
        @defect-number-click="openDialogTable"
      ></CardNode>
    </template>
    <DialogTable
      :visible.sync="dialogVisible"
      :filter-info="dialogTableData"
    ></DialogTable>
    <di-show-dialog
      :show.sync="showDialog"
      :data="activeData"
      :type="diShowType"
    ></di-show-dialog>
  </div>
</template>
<script>
/**
 * @title tfs 项目代号卡片列表
 * @author wuqian
 * @date 2020.9.7
 */
import { mapState } from 'vuex'
import CardNode from './CardNode'
import DialogTable from '../../DialogTable'
import DiShowDialog from './DiShowDialog'
import { defectTypes } from '../../util'
export default {
  name: 'ProjectCodeCards',
  components: { CardNode, DialogTable, DiShowDialog },
  props: {
    data: {
      type: Array,
      required: true,
      desc: '数据',
    },
    productType: {
      type: [Number, Object, String],
      default: '',
      required: true,
      desc: '集合Id',
    },
  },
  data() {
    return {
      dialogVisible: false,
      dialogTableData: {},
      showDialog: false,
      // 当前点击卡片数据
      activeData: {},
      diShowType: 'currentDI',
    }
  },
  computed: {
    ...mapState({
      cardsData: state => state.tfsKanban.projectCards,
      filterInfo: state => state.tfsKanban.filterInfo,
    }),
  },

  methods: {
    openDialogTable(props, type) {
      const { teamId, moduleId, projectId } = props
      this.dialogVisible = true
      this.dialogTableData = {
        productType: this.productType,
        teamId,
        moduleId,
        projectCodes: projectId.split('/').filter(item => !!item),
        severitys: [defectTypes[type]?.type],
      }
    },
    handleDiClick(data, type) {
      this.diShowType = type
      this.activeData = data
      this.activeData.productType = this.productType
      this.showDialog = true
    },
  },
}
</script>
<style lang="scss" scoped></style>
