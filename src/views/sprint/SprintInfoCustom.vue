<template>
  <div
    v-loading="loading"
    element-loading-text
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255, 0.5)"
  >
    <div class="custom-header">
      <el-button type="text" @click="backBtn"
        >&lt;&lt;{{ $t('返回') }}</el-button
      >
      <el-form
        :label-width="$isEnglish() ? '160px' : '80px'"
        class="header-form"
      >
        <el-form-item :label="$t('模板名称')">
          <el-input
            v-model.trim="form.name"
            :placeholder="$t('请输入模板名称')"
            @change="updateTemplate"
            @blur="updateTemplate"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('模板描述')">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            :placeholder="$t('请输入模板描述')"
            @change="updateTemplate"
            @blur="updateTemplate"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-contain">
      <el-table row-key="id" align="left" style="width: 100%">
        <el-table-column
          prop
          :label="$t('序号')"
          :width="$isEnglish() ? 80 : 60"
        ></el-table-column>
        <el-table-column
          prop="stageName"
          :label="
            $authFunction('FUNC_COOP_SPRINT_STAGE_SORT', 3, projectId)
              ? $t('阶段名 (可拖拽名称进行排序)')
              : $t('阶段名')
          "
          class-name="list-name"
        >
          <template slot-scope="scope">
            <span>{{ scope.stageName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop :label="$t('操作')" width="120"></el-table-column>
      </el-table>
      <draggable
        :list="tableData"
        :disabled="false"
        class="list-group"
        ghost-class="ghost"
        :options="{ filter: '.notdraggable' }"
        @end="endMove"
      >
        <ul v-for="(item, $index) in tableData" :key="item.id">
          <li
            :class="{
              notdraggable:
                item.stageName == '开始启动' || item.stageName == '已完成',
              'list-poniter':
                item.stageName !== '开始启动' && item.stageName !== '已完成',
            }"
          >
            <span class="sort-text">{{ $index + 1 }}</span>
            <span style="width:31px;display: inline-block;"></span>
            <span v-if="item.showtext">{{ item.stageName }}</span>
            <input v-if="!item.showtext" v-model="item.stageName" type="text" />
            <span
              v-show="
                item.stageName == $t('开始启动')
                  ? false
                  : item.stageName == $t('已完成')
                  ? false
                  : true
              "
              v-if="
                item.showtext &&
                  $authFunction('FUNC_COOP_SPRINT_STAGE_DELETE', 3, projectId)
              "
              class="list-delete"
              @click="handleDeleteClick(item)"
              >{{ $t('删除') }}</span
            >
            <span class="list-delete"></span>
            <span
              v-show="
                item.stageName == $t('开始启动')
                  ? false
                  : item.stageName == $t('已完成')
                  ? false
                  : true
              "
              v-if="
                item.showtext &&
                  $authFunction('FUNC_COOP_SPRINT_STAGE_UPDATE', 3, projectId)
              "
              class="list-delete"
              @click="handleEaitClick(item)"
              >{{ $t('编辑') }}</span
            >
            <span
              v-show="
                item.stageName == $t('开始启动')
                  ? true
                  : item.stageName == $t('已完成')
                  ? true
                  : false
              "
              class="list-delete"
            ></span>
            <span
              v-if="!item.showtext"
              class="list-delete"
              @click="cancleEaitClick(item)"
              >{{ $t('取消') }}</span
            >
            <span class="list-delete"></span>
            <span
              v-if="!item.showtext"
              class="list-delete"
              @click="saveEaitClick(item)"
              >{{ $t('保存') }}</span
            >
          </li>
        </ul>
      </draggable>
    </div>
    <footer class="footer">
      <el-button
        v-show="$authFunction('FUNC_COOP_SPRINT_STAGE_ADD', 3, projectId)"
        type="text"
        @click="creatBtn"
        >{{ $t('新建迭代阶段') }}</el-button
      >
      <el-button
        v-show="
          $authFunction('FUNC_COOP_SPRINT_STAGE_ADD', 3, projectId) &&
            type === 'add'
        "
        type="primary"
        @click="saveBtn"
        >{{ $t('保存') }}</el-button
      >
    </footer>

    <el-dialog :title="$t('新建阶段')" :visible.sync="diagloshow" width="600">
      <div class="date-container">
        <div class="data-left">
          <span class="data-icon">{{ $t('阶段名') }}：</span>
          <el-input
            v-model="stageName"
            :placeholder="$t('请输入内容')"
            style="width:80%;"
          ></el-input>
        </div>
        <!-- <div class="data-left" style="margin:10px 0;">
          <span
            class="data-icon"
            style="display: inline-block;margin-bottom: 18px;"
          >描 &nbsp;&nbsp;述：</span>
          <el-input type="textarea" placeholder="请输入内容" v-model="stageDesc" style="width:80%;"></el-input>
        </div>-->
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancleBtn">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="confirmBtn">{{
          $t('确定')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 迭代阶段模板详情
 * @desc
 * @author panhui | heyunjiang
 * @date 2019.7.29
 */
// import Sortable from 'sortablejs'
import draggable from 'vuedraggable'
// import GlobalInput from '@/components/field-edit/GlobalInput.vue'
import * as sprintService from '@/service/sprint'

export default {
  name: 'SprintInfoDateModified',
  components: { draggable },
  mixins: [],
  props: {
    templateId: {
      type: [Number, String],
      required: true,
      desc: '模板 id',
    },

    type: {
      type: String,
      required: false,
      desc: '当前类型，新增或更新',
      default: 'add',
      validator: value => {
        return ['add', 'update'].includes(value)
      },
    },
  },

  data() {
    return {
      form: {
        name: '', // 模板名称
        description: '', // 模板描述
      },
      tableData: [], // 迭代阶段数据
      // dragging: false,
      diagloshow: false,
      stageName: '',
      stageDesc: '',
      showtext: true,
      sortShow: true,
      canDelete: true,
      deleteItem: {},
      projectId: this.$getUrlParams().projectId,
      loading: false,
      addIdPoor: [], // 新建迭代阶段的临时 id 池
      cacheStageName: '', // 缓存数据，当点击取消时，回滚数据
    }
  },
  computed: {},
  watch: {
    templateId() {
      this.initData()
    },
  },
  mounted() {
    this.initData()
  },

  created() {},
  methods: {
    initData() {
      this.addIdPoor = []
      if (this.type === 'add') {
        this.initStageList()
      } else {
        this.initTemplateInfo()
      }
    },
    // 修改时 - 初始化数据
    async initTemplateInfo() {
      if (this.templateId === -1) {
        return
      }
      let result = {}
      try {
        this.loading = true
        result = await sprintService.templateInfo({
          projectId: this.projectId || this.$getUrlParams().projectId,
          templateId: this.templateId,
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '获取迭代阶段模板数据失败',
        //   type: 'error'
        // })
        return
      }
      this.form = { ...result.data.template }
      this.tableData =
        result.data.sprintStageList.map((item, index) => {
          return {
            ...item,
            showtext: true,
            sort: index,
          }
        }) || []
    },
    // 新增时 - 获取模板阶段列表数据
    async initStageList() {
      let result = {}
      try {
        this.loading = true
        result = await sprintService.stageList({
          projectId: this.projectId || this.$getUrlParams().projectId,
          templateId: 0,
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '获取迭代阶段模板初始数据失败',
        //   type: 'error'
        // })
        return
      }
      this.tableData = result.data.map((item, index) => {
        return {
          ...item,
          showtext: true,
          sort: index,
        }
      })
    },
    // 拖拽结束处理 - 分为新建和更新2种处理
    endMove(evt) {
      if (
        !this.$authFunction('FUNC_COOP_SPRINT_STAGE_SORT', 3, this.projectId)
      ) {
        return false
      }
      //移动之后改变序列号
      if (evt.newIndex == 0) {
        this.$message({ message: i18n.t('不能调整至首位'), type: 'info' })
        evt.newIndex = evt.oldIndex
        return false
      }
      if (evt.newIndex == this.tableData.length - 1) {
        this.$message({ message: i18n.t('不能调整至末位'), type: 'info' })
        evt.newIndex = evt.oldIndex
        return false
      }
      if (this.type === 'add') {
        return false
      }
      sprintService
        .stageSort({
          templateId: this.templateId,
          stageIdList: this.tableData.map(item => item.id),
        })
        .then(res => {
          if (res.status == 200) {
            this.initData()
          }
        })
    },
    // 新建迭代阶段 - 生成临时 id
    generateNewStageId() {
      let id = this.addIdPoor.length + 1
      this.addIdPoor.push(id)
      return id
    },
    // 新建迭代阶段 - 点击确定
    confirmBtn() {
      //新建阶段
      if (!this.stageName.trim()) {
        this.$message({ message: i18n.t('请输入名称') })
        return false
      }
      this.diagloshow = false
      let obj = {
        stageName: this.stageName,
        stageDesc: this.stageDesc,
        templateId: this.templateId,
      }

      if (this.type === 'add') {
        // 如果是新建，则直接更新 tableData 对象即可，在最后一个之前插入数据
        const position = this.tableData.length
        this.tableData.splice(position - 1, 0, {
          id: this.generateNewStageId(),
          sort: position,
          stageDesc: this.stageDesc,
          stageName: this.stageName,
          templateId: 0,
          showtext: true,
        })
      } else {
        sprintService.stageAdd(obj).then(res => {
          if (res.status == 200) {
            this.$message({
              message: res.msg || i18n.t('新建迭代阶段成功'),
              type: 'success',
            })

            this.initData()
          } else {
            // this.$message({ message: res.msg || "新建迭代阶段失败", type: "error" });
          }
        })
      }
    },
    // 新建迭代阶段 - 点击取消
    cancleBtn() {
      this.diagloshow = false
    },
    // 操作前的确认
    async confirmBeforeOperate(text = '') {
      let result = null
      try {
        result = await this.$confirm(text, {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        })
      } catch (_) {
        result = false
      }
      return result
    },
    // 点击顶部返回
    backBtn() {
      this.$emit('back')
    },
    //  新建迭代阶段 - 点击新建
    creatBtn() {
      this.stageName = ''
      this.diagloshow = true
    },
    // 迭代阶段修改 - 点击编辑
    handleEaitClick(item) {
      this.cacheStageName = item.stageName
      item.showtext = false
      this.$forceUpdate() //刷新列表
    },
    // 迭代阶段修改 - 点击保存
    saveEaitClick(item) {
      if (this.type === 'add') {
        if (item.stageName.trim() === '') {
          this.$message({ message: i18n.t('请输入名称') })
          return false
        }
        // 如果是新建，则直接更新 tableData 对象即可
        this.tableData = this.tableData.map(jtem => {
          return {
            ...jtem,
            showtext: true,
            stageName: jtem.id === item.id ? item.stageName : jtem.stageName,
          }
        })
      } else {
        if (item.stageName.trim() === '') {
          this.$message({ message: i18n.t('请输入名称') })
          return false
        }
        let obj = {
          id: item.id,
          stageName: item.stageName,
          templateId: this.templateId,
        }

        sprintService.stageUpdate(obj).then(res => {
          if (res.status == 200) {
            this.$message({
              message: res.msg || i18n.t('修改成功'),
              type: 'success',
            })

            this.initData()
          } else {
            // this.$message({ message: res.msg || "修改失败", type: "success" });
          }
        })
      }
    },
    // 更新迭代阶段的名称、描述
    async updateTemplate() {
      if (this.type === 'add') {
        return
      }
      let result = {}
      try {
        this.loading = true
        result = await sprintService.templateUpdate({
          projectId: this.projectId || this.$getUrlParams().projectId,
          id: this.templateId,
          ...this.form,
          // sprintStageList: this.tableData
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '更新失败',
        //   type: 'error'
        // })
      } else {
        this.$message({
          message: result.msg || i18n.t('更新成功'),
          type: 'success',
        })

        this.initData()
      }
    },
    // 迭代阶段修改 - 点击取消
    cancleEaitClick(item) {
      item.stageName = this.cacheStageName
      item.showtext = true
      this.$forceUpdate() //刷新列表
    },
    // 迭代阶段修改 - 点击删除
    async handleDeleteClick(item) {
      const result = await this.confirmBeforeOperate(
        `${i18n.t('确定删除阶段')}${item.stageName}${i18n.t('吗')}？`,
      )

      if (!result) {
        return
      }
      if (this.type === 'add') {
        // 如果是新建，则直接更新 tableData 对象即可
        this.tableData = this.tableData.filter(jtem => item.id !== jtem.id)
      } else {
        sprintService
          .stageDelete(
            { stageId: item.id, templateId: this.templateId },
            { type: 'form' },
          )
          .then(res => {
            if (res.status == 200) {
              this.initData()
              this.$message({
                message: res.msg || i18n.t('删除成功'),
                type: 'success',
              })

              item.showtext = true
            } else {
              this.$message({
                message: res.msg || i18n.t('删除失败'),
                type: 'error',
              })
            }
          })
      }
    },
    // 点击保存
    async saveBtn() {
      if (this.form.name.length === 0) {
        this.$message({
          message: i18n.t('模板名称不能为空'),
          type: 'warning',
        })

        return
      }
      let result = {}
      try {
        this.loading = true
        result = await sprintService.templateAdd({
          projectId: this.projectId || this.$getUrlParams().projectId,
          name: this.form.name,
          description: this.form.description,
          sprintStageList: this.tableData.map(item => item.stageName),
        })
      } finally {
        this.loading = false
      }
      if (!result.status || result.status !== 200) {
        // this.$message({
        //   message: result.msg || '创建失败',
        //   type: 'error'
        // })
        return
      } else {
        this.$message({
          message: result.msg || i18n.t('创建成功'),
          type: 'success',
        })

        this.$emit('back')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
// 顶部返回按钮和 form 表单
.custom-header {
  margin-bottom: 10px;
  font-size: 14px;
  .header-form {
    width: 400px;
  }
}
// table
.list-contain {
  position: relative;
  padding: 0 10px;
  .list-group {
    // position: absolute;
    // top: 42px;
    // left: 17px;
    background: #fff;
    // min-width: calc(100% - 85px);
    min-width: calc(100% - 20px);
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      border-bottom: 1px solid #eae9e9;
    }
    li {
      padding: 7px 0;
      width: calc(100% - 47px);
      .sort-text {
        padding-left: 11px;
        width: 25px;
        display: inline-block;
      }
    }
  }
  .list-name {
    div {
      // background: red !important;
    }
  }
  .list-delete {
    color: #409eff;
    cursor: pointer;
    float: right;
    margin-right: 5px;
  }
  .list-poniter {
    cursor: pointer;
  }
}
.notdraggable {
  cursor: not-allowed;
}
footer {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
</style>
