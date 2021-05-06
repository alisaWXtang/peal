<template>
  <div id="projectList" class="content-outer-box project-list">
    <div class="mine-content">
      <el-card class="page-content-box-width" shadow="never">
        <div class="project__head">
          <span class="header-filter-btn-box">
            <span
              class="header-filter-btn"
              style="font-size: 16px;font-weight: 900"
              >{{ $t('项目列表') }}</span
            >
            <span
              class="header-filter-btn"
              :class="{
                'filter-active': TagNameInfo.active === listTag.ongoing,
                'filter-inactive': TagNameInfo.active !== listTag.ongoing,
              }"
              type="text"
              @click="shortcutClick(false)"
              >{{ $t('进行中') }}</span
            >
            <span
              class="header-filter-btn"
              :class="{
                'filter-active': TagNameInfo.active === listTag.end,
                'filter-inactive': TagNameInfo.active !== listTag.end,
              }"
              type="text"
              @click="shortcutClick(true)"
              >{{ $t('已结束') }}</span
            >
            <span
              v-for="item in totalTagList"
              :key="item.id"
              class="header-filter-btn"
              :class="{
                'filter-active': TagNameInfo.active === item.id,
                'filter-inactive': TagNameInfo.active !== item.id,
              }"
              type="text"
              @click="getLabelList(item.id)"
              >{{ item.name }}</span
            >
          </span>
          <span
            class="search-creeate-manage-wrapper"
            :class="{ 'search-creeate-manage-wrapper-english': $isEnglish() }"
          >
            <span
              style="display: inline-block;width: 220px;margin-right: 10px;"
            >
              <el-input
                v-model="projectName"
                v-focus
                class="project-filter-input"
                :placeholder="$t('请输入项目名称')"
                @keyup.enter.native="filterProjectList"
              >
                <i
                  slot="suffix"
                  class="el-input__icon el-icon-search"
                  @click="filterProjectList"
                ></i>
              </el-input>
            </span>
            <FunctionGuideTips
              is-in-page
              class="create-tips"
              storage-visible-key="createProject"
              tips="创建项目，可选择复制其他项目的项目模板，适用于项目成员、角色、权限、工作项配置相同的项目。"
              placement="top"
            >
              <el-button
                v-show="$authFunction('FUNC_COOP_PROJ_CREATE', 0)"
                type="primary"
                @click="createProject"
                >{{ $t('创建项目') }}
              </el-button>
            </FunctionGuideTips>
            <el-button class="ml10 " @click="addTapsBtn()"
              >{{ $t('标签管理') }}
            </el-button>
            <GuidePop v-if="guideVisble" ref="guidePop" />
          </span>
        </div>
        <div class="table-box-top">
          <!--          :border="projectListData.length !== 0"-->
          <el-table
            v-loading="loading"
            class="list-table multiple-table"
            :data="projectListData"
            :element-loading-text="
              demoloadWords ? $t('示例项目创建中') : $t(' 数据拼命加载中 ')
            "
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgb(255,255,255)"
            :class="{ 'el-table-left-none': projectListData.length == 0 }"
          >
            <el-table-column :label="$t('项目名称')" min-width="100">
              <template slot-scope="scope">
                <el-link
                  type="primary"
                  :underline="false"
                  @click="intentDemandList(scope.row)"
                >
                  <span>{{ scope.row.name }}</span>
                  <el-tooltip
                    v-if="scope.row.projectType"
                    effect="dark"
                    placement="top-start"
                  >
                    <div slot="content">
                      {{ $t('示例项目仅做示例演示') }}，<br />{{
                        $t('里面的数据不会出现在TT每日提醒里')
                      }}。
                    </div>
                    <span class="demoProj">{{ $t('示例') }}</span>
                  </el-tooltip>
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('项目负责人')"
              min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span :title="scope.row.managerStr">{{
                  scope.row.managerStr
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="description"
              :label="$t('项目描述')"
              min-width="100"
            ></el-table-column>
            <el-table-column
              prop="createTime"
              :label="$t('创建时间')"
              min-width="100"
            ></el-table-column>
            <el-table-column :label="$t('操作')" min-width="100">
              <template slot-scope="scope">
                <div class="opreatebtns">
                  <el-button
                    v-if="scope.row.authority && scope.row.authority.editable"
                    type="text"
                    @click="editProject(scope.row)"
                    >{{ $t('编辑') }}</el-button
                  >
                  <el-button
                    v-if="
                      scope.row.authority &&
                        scope.row.authority.completable &&
                        !scope.row.completed
                    "
                    type="text"
                    @click="endProject(scope.row)"
                    >{{ $t('结束') }}</el-button
                  >
                  <el-button
                    v-if="scope.row.authority && scope.row.authority.deletable"
                    type="text"
                    @click="deleteProject(scope.row)"
                    >{{ $t('删除') }}</el-button
                  >
                  <el-button type="text" @click="useTag(scope.row)">{{
                    $t('项目标签')
                  }}</el-button>
                  <el-button type="text" @click="quitProject(scope.row)">{{
                    $t('退出项目')
                  }}</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-box-footer">
            <el-pagination
              v-if="
                projectStatusData.filterInfo.pageInfo.totalPages > 0 && showPage
              "
              background
              size="middle"
              layout="total, prev, pager, next"
              :current-page="projectStatusData.filterInfo.pageInfo.pageNumber"
              :page-size="projectStatusData.filterInfo.pageInfo.pageSize"
              :page-count="projectStatusData.filterInfo.pageInfo.totalPages"
              :total="projectStatusData.filterInfo.pageInfo.totalRecords"
              @current-change="pagainationChange"
            >
            </el-pagination>
          </div>
        </div>
        <!--创建项目，编辑项目-->
        <project-creat-or-edit-dialog
          :loading.sync="loading"
          :dialog-visible.sync="dialogVisible"
          :project-flag="flag"
          :edit-product-info="projectInfo"
          :project-list="ProjectListAll"
          :create-project-success="createProjectSuccess"
          :edit-project-success="editProjectSuccess"
          @changeLoadingWords="changeLoadingWords"
        ></project-creat-or-edit-dialog>

        <!-- 标签管理 -->
        <el-dialog
          :title="$t('标签管理')"
          :visible.sync="dialogVisibleTab"
          class="issuedialog el-dialog-740w"
          :before-close="handleClose"
          :modal-append-to-body="modaltobody"
          :close-on-click-modal="shadeBtn"
          :append-to-body="modaltobody"
        >
          <div class="form-iterm-box">
            <div class="addclassTap">
              <span class="tapTitile fl">{{ $t('标签信息') }}</span>
              <el-button
                type="primary"
                class="addtap"
                style="padding-bottom: 5px;"
                @click="showCreateTagDialog()"
                >+{{ $t('添加标签') }}
              </el-button>
            </div>
            <!--            :border="totalTagList.length !== 0"-->
            <el-table
              class="dialog-table"
              :data="totalTagList"
              style="width: 100%;height: 100%;overflow:auto;"
            >
              <el-table-column prop="name" :label="$t('名称')" min-width="120">
              </el-table-column>
              <el-table-column
                prop="createTime"
                :label="$t('创建时间')"
                min-width="80"
              >
              </el-table-column>
              <el-table-column
                prop="updateTime"
                :label="$t('更新时间')"
                min-width="80"
              >
              </el-table-column>
              <el-table-column width="120" align="left" :label="$t('操作')">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    @click="showEditTagDialog(scope.row)"
                    >{{ $t('编辑') }}</el-button
                  >
                  <el-button type="text" @click="showDelTagDialog(scope.row)">{{
                    $t('删除')
                  }}</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose">{{ $t('关闭') }}</el-button>
          </span>
        </el-dialog>

        <!-- 添加标签 -->
        <el-dialog
          :title="TagNameInfo.tapTitle"
          :visible.sync="dialogVisible_a"
          destroy-on-close
          class="el-dialog-350w issuedialog"
          :before-close="closeTagEditDialog"
          :modal-append-to-body="modaltobody"
          :close-on-click-modal="shadeBtn"
          :append-to-body="modaltobody"
        >
          <div class="form-iterm-box">
            <el-form
              ref="TagNameInfo"
              :model="TagNameInfo"
              @submit.native.prevent
            >
              <el-form-item
                :label="$t('标签')"
                class="mt15"
                :label-width="$isEnglish() ? '60px' : '55px'"
                prop="inputTagName"
                :rules="[
                  { required: true, message: $t('不能为空'), trigger: 'blur' },
                ]"
              >
                <el-input
                  v-model.trim="TagNameInfo.inputTagName"
                  style="width: 100%;"
                  :placeholder="$t('请输入标签名称，字数控制20字以内')"
                >
                </el-input>
              </el-form-item>
            </el-form>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="closeTagEditDialog()">{{
              $t('关闭')
            }}</el-button>
            <el-button type="primary" @click="saveOrUpdateTag()">{{
              $t('保存')
            }}</el-button>
          </span>
        </el-dialog>
        <!-- 设置项目标签 -->
        <el-dialog
          :title="$t('设置项目标签')"
          :visible.sync="dialogAppTagVisible"
          class="el-dialog-350w issuedialog"
          :before-close="handleSetAppTagDialogClose"
          :modal-append-to-body="modaltobody"
          :append-to-body="modaltobody"
          :close-on-click-modal="shadeBtn"
        >
          <div class="form-iterm-box">
            <el-form>
              <el-form-item
                :gutter="10"
                class="mt20"
                :label="$t('标签')"
                label-width="60px"
              >
                <el-select
                  v-model="setProject.projectSetIdList"
                  multiple
                  :placeholder="$t('请选择')"
                  :popper-append-to-body="true"
                  style="width:100%;"
                >
                  <el-option
                    v-for="item in totalTagList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="handleSetAppTagDialogClose">{{
              $t('关闭')
            }}</el-button>
            <el-button type="primary" @click="bindAppTag()">{{
              $t('保存')
            }}</el-button>
          </span>
        </el-dialog>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { i18n } from '@/i18n'
import ProjectCreatOrEditDialog from './ProductCreateOrEditDialog'
import FunctionGuideTips from '@/components/biz/function-guide-tips'
import GuidePop from './guidePop'
import * as projectListService from '@/service/project-list'
import { guideType } from '../../components/guide/guideData'
import { guide } from '@/store/mutation-types'

export default {
  name: 'ProjectList',
  components: {
    ProjectCreatOrEditDialog,
    FunctionGuideTips,
    GuidePop,
  },
  data() {
    return {
      listTag: {
        ongoing: 1, // 进行中
        end: 2, // 已结束
      },
      projectName: '',
      showPage: true, //是否展示分页
      totalTagList: [], //标签数据
      modaltobody: true,
      shadeBtn: false,
      TagNameInfo: {
        active: 1,
        inputTagName: '',
      },
      demoloadWords: false,
      id: '',
      projectInfo: {
        name: '',
        // categories:"",//项目分类
        description: '',
      }, // 新建项目信息，编辑(名称、描述、结束、删除)在进入项目后的设置里面
      flag: '', // 新建/编辑
      dialogVisibleTab: false,
      setProject: {
        projectSetIdList: [], //设置项目标签集合
        projectId: '', //当前项目id
      },
      dialogVisible: false, // 创建项目 dialog
      dialogVisible_a: false,
      dialogAppTagVisible: false,
      projectListData: [],
      editProjectId: null, // 编辑项目时的 id
      loading: false,
      guideLoading: true,
      needGuide: false,
      projectStatusData: {
        filterInfo: {
          completed: false, // true -> 已结束， false -> 进行中
          pageInfo: {
            pageNumber: 1,
            pageSize: 20,
            totalPages: 0,
          },
        },
      },
    }
  },
  computed: {
    ProjectListAll() {
      return this.$store.state.pf.ProjectListAll
    },
    guideVisble() {
      return this.needGuide && this.$store.state.guide.guideType
    },
  },
  watch: {
    projectListData() {
      this.$store.dispatch('getGuideProject')
    },
  },
  async mounted() {
    await this.getSetLabel()
    this.getProjectList()
    this.$bus.$on('G_projectNeedGuide', this.projectNeedGuide)
    if (
      this.$getUrlParams().guideType === guideType.wholeProcess &&
      this.$store.state.guide.visible === false
    ) {
      this.$store.commit(guide.CHANGE_GUIDE_DIALOG_VISIBLE, true)
    }
    if (this.$getUrlParams().needGuide) {
      this.needGuide = true
      let query = JSON.parse(JSON.stringify(this.$getUrlParams()))
      delete query.needGuide
      this.$router.replace({
        path: this.$route.path,
        query: query,
      })
    }
    this.$bus.$on('G_closeGuide', this.closeGuide)
  },
  beforeDestroy() {
    this.$bus.$off('G_projectNeedGuide', this.projectNeedGuide)
    this.$bus.$off('G_closeGuide', this.closeGuide)
  },
  methods: {
    closeGuide() {
      this.needGuide = false
    },
    projectNeedGuide() {
      this.needGuide = true
      this.$nextTick(() => {
        this.$refs.guidePop.visible = true
      })
    },
    ...mapActions(['getUserInfo']),
    getProjectName() {
      return this.projectName.trim()
    },
    filterProjectList() {
      if (
        this.TagNameInfo.active === this.listTag.ongoing ||
        this.TagNameInfo.active === this.listTag.end
      ) {
        this.getProjectList(true)
      } else {
        this.getLabelList(this.id)
      }
    },
    //项目标签
    useTag(item) {
      this.countlyLog('project_list_projectLabel')
      this.setProject.projectId = item.id
      this.dialogAppTagVisible = true
      projectListService.getProjectProjectSetList({ id: item.id }).then(res => {
        this.setProject.projectSetIdList = res.data
      })
    },
    // 退出项目
    quitProject(item) {
      const title = `${i18n.t('退出项目')}：${item.name}？`
      this.$confirm(
        i18n.t('退出项目后，将无法再继续访问和操作该项目。'),
        title,
        {
          customClass: 'project-handle-dialog',
          confirmButtonText: i18n.t('退出项目'),
          cancelButtonText: i18n.t('取消'),
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '执行中...'
              projectListService
                .quitPoject({ id: item.id })
                .then(res => {
                  if (res.status === 200) {
                    this.$message.success(i18n.t('退出项目成功'))

                    this.getProjectList()
                  }

                  instance.confirmButtonLoading = false
                  instance.confirmButtonText = i18n.t('确定')
                  done()
                })
                .catch(() => {
                  instance.confirmButtonLoading = false
                  instance.confirmButtonText = i18n.t('确定')
                })
            } else {
              done()
            }
          },
        },
      )
    },
    setProjectListData(data) {
      data &&
        data.forEach(item => {
          let managerStr = ''
          item.display &&
            item.display.managerList &&
            item.display.managerList.forEach(el => {
              managerStr = `${managerStr}${el.userName}(${el.userId}), `
            })
          Object.assign(item, {
            managerStr: managerStr.slice(0, -2),
          })
        })
      return data || []
    },
    bindAppTag() {
      projectListService
        .updateProjectSetConfig({
          projectSetIdList: this.setProject.projectSetIdList,
          projectId: this.setProject.projectId,
        })
        .then(res => {
          if (res.status === 200) {
            this.dialogAppTagVisible = false
            if (
              this.TagNameInfo.active !== this.listTag.ongoing &&
              this.TagNameInfo.active !== this.listTag.end
            ) {
              this.loading = true
              projectListService
                .getProjectSetProjectList({
                  projectSetId: this.id,
                })
                .then(result => {
                  this.loading = false
                  this.projectListData = this.setProjectListData(result.data)
                  this.showPage = false
                  // this.projectStatusData.filterInfo.pageInfo = res.data.pageInfo;
                })
            }
          }
        })
    },
    handleSetAppTagDialogClose() {
      this.dialogAppTagVisible = false
    },
    async getSetLabel() {
      const res = await projectListService.getProjectSetList()
      this.totalTagList = res.data
      this.projectStatusData.filterInfo.pageInfo.totalPages = 0
    },
    changeLoadingWords(val) {
      this.loading = val
      this.demoloadWords = val
    },
    getLabelList(id) {
      this.id = id
      this.TagNameInfo.active = id
      this.loading = true
      const params = { projectSetId: id }
      const projectName = this.getProjectName()
      if (projectName) {
        Object.assign(params, {
          keyword: projectName,
        })
      }
      projectListService.getProjectSetProjectList(params).then(res => {
        this.loading = false
        this.projectListData = this.setProjectListData(res.data)
        this.showPage = false
        // this.projectStatusData.filterInfo.pageInfo = res.data.pageInfo;
      })
    },
    saveOrUpdateTag() {
      if (
        !this.TagNameInfo.inputTagName ||
        this.TagNameInfo.inputTagName.length === 0
      ) {
        this.$message({
          message: i18n.t('请输入标签名'),
          type: 'warning',
        })

        return
      }
      if (this.TagNameInfo.inputTagName.length > 20) {
        this.$message({
          message: i18n.t('输入的标签名过长'),
          type: 'warning',
        })

        return
      }

      if (this.inputTagId) {
        projectListService
          .updateProjectSet({
            id: this.inputTagId,
            name: this.TagNameInfo.inputTagName,
          })
          .then(res => {
            if (res.status === 200) {
              this.$message({
                type: 'success',
                message: i18n.t('修改标签成功'),
              })

              this.closeTagEditDialog()
              this.getSetLabel()
            } else {
              this.$message({
                type: 'error',
                message: res.msg,
              })
            }
          })
      } else {
        projectListService
          .createProjectSet({
            name: this.TagNameInfo.inputTagName,
          })
          .then(res => {
            if (res.status !== 200) {
              this.$message({
                type: 'error',
                message: res.msg,
              })
            } else {
              this.$message({
                type: 'success',
                message: i18n.t('添加标签成功'),
              })

              this.closeTagEditDialog()
              this.getSetLabel()
            }
          })
          .catch(() => {
            this.$message({
              type: 'error',
              message: i18n.t('添加标签失败'),
            })
          })
      }
    },
    //删除标签
    showDelTagDialog(tag) {
      this.$confirm(
        `${i18n.t('此操作删除该标签')}['${tag.name}'], ${i18n.t('是否继续')}?`,
        i18n.t('提示'),
        {
          confirmButtonText: i18n.t('确定'),
          cancelButtonText: i18n.t('取消'),
          type: 'warning',
        },
      )
        .then(() => {
          projectListService
            .deleteProjectSet({ id: tag.id }, { type: 'form' })
            .then(res => {
              if (res.status === 200) {
                this.$message({
                  type: 'success',
                  message: `${i18n.t('删除成功')}!`,
                })

                this.projectStatusData.filterInfo.completed = false
                this.TagNameInfo.active = this.listTag.ongoing
                this.getProjectList()
                this.getSetLabel()
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg,
                })
              }
            })
        })
        .catch(() => {})
    },
    //小弹窗编辑标签
    showEditTagDialog(tag) {
      this.height_a = 'editBtn'
      this.TagNameInfo.tapTitle = i18n.t('编辑标签')
      this.dialogVisible_a = true
      this.TagNameInfo.inputTagName = tag.name
      // this.TagNameInfo.inputTagType = tag.type;
      this.inputTagId = tag.id
    },
    //添加标签(小弹窗)
    showCreateTagDialog() {
      this.inputTagId = null
      this.TagNameInfo.inputTagName = ''
      // this.TagNameInfo.inputTagType = 0;
      // this.height_a = 'addTop';
      this.TagNameInfo.tapTitle = i18n.t('创建标签')
      this.dialogVisible_a = true
    },
    //点击取消按钮关闭标签管理弹窗
    closeTagEditDialog() {
      this.dialogVisible_a = false
    },
    //标签管理
    addTapsBtn() {
      this.countlyLog('project_list_labelManage')
      this.dialogVisibleTab = true
    },
    //关闭标签弹窗
    handleClose() {
      this.dialogVisibleTab = false
    },

    intentDemandList(data) {
      let projectId = data.id
      if (projectId !== localStorage.getItem('projectId')) {
        this.$store.dispatch({
          type: 'clearAssignUserList',
        })
        localStorage.setItem('projectId', projectId)
      }
      this.$router.push({ name: 'requirementList', query: { projectId } })
      // 更新全局项目缓存 - 1
      this.$store.dispatch({
        type: 'updateCacheProjectId',
        payload: { projectId },
      })
    },
    getProjectList(notUpdateAll) {
      const projectName = this.getProjectName()
      if (projectName) {
        Object.assign(this.projectStatusData.filterInfo, {
          keyword: projectName,
        })
      } else {
        delete this.projectStatusData.filterInfo.keyword
      }
      this.loading = true
      projectListService
        .getProjectList({
          ...this.projectStatusData.filterInfo,
        })
        .then(res => {
          this.loading = false
          this.projectListData = this.setProjectListData(res.data.results)
          this.projectStatusData.filterInfo.pageInfo = res.data.pageInfo
          this.guideLoading = false
        })
      // 不是更新列表时，需要更新全局的项目列表
      !notUpdateAll && this.$store.dispatch('getProjectListAll')
    },
    // 创建项目
    createProject() {
      this.flag = 'creat'
      this.dialogVisible = true
    },
    // 编辑项目
    editProject(info) {
      this.flag = 'edit'
      this.dialogVisible = true
      this.projectInfo.editProjectId = info.id
      this.projectInfo.projectType = info.projectType
      this.projectInfo.name = info.name
      this.projectInfo.target = info.target
      this.projectInfo.adminUsers = info.managerList
      this.projectInfo.description = info.description
      this.projectInfo.departmentIds =
        info?.departments?.map(item => item.id) || []
    },
    // 取消创建取消编辑
    handleCloseProject() {
      // this.$refs["projectInfo"].resetFields();
      this.projectInfo.name = ''
      this.projectInfo.description = ''
      this.dialogVisible = false
    },
    createProjectSuccess() {
      this.TagNameInfo.active = 1
      // 创建项目成功后查‘进行中’列表
      this.projectStatusData.filterInfo.completed = false
      this.getProjectList()
      // 在创建项目成功后，强制刷新缓存
      this.getUserInfo()
    },
    editProjectSuccess() {
      const { TagNameInfo: { active } = {} } = this
      // 当前激活的是自定义标签时
      if (active > 2) {
        this.getLabelList(active)
      } else {
        this.getProjectList()
      }

      // 更新用户权限
      this.getUserInfo()
    },
    // 过滤器切换
    shortcutClick(bool = false) {
      this.showPage = true
      if (bool) {
        this.TagNameInfo.active = this.listTag.end
      } else {
        this.TagNameInfo.active = this.listTag.ongoing
      }
      this.projectStatusData.filterInfo.completed = bool
      this.projectStatusData.filterInfo.pageInfo.pageNumber = 1
      this.$nextTick(() => {
        this.getProjectList(true)
      })
    },
    // 分页
    pagainationChange(num) {
      if (
        this.TagNameInfo.active === this.listTag.ongoing ||
        this.TagNameInfo.active === this.listTag.end
      ) {
        this.projectStatusData.filterInfo.pageInfo.pageNumber = num
        this.$nextTick(() => {
          this.getProjectList(true)
        })
      } else {
        this.getLabelList(this.id)
      }
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
    // 删除项目操作前的确认
    async confirmDeleteProject(name) {
      let result = null
      try {
        const message = `
          <div>${i18n.t(
            '删除项目会删除项目内的所有数据（包括需求、任务、状态、缺陷、迭代、报表、报告、文档、研发等数据）',
          )}</div>
          <div style="color: rgb(216, 69, 77);">${i18n.t(
            '删除操作无法恢复！项目若有重要数据，请谨慎。',
          )}</div>
        `
        const title = `${i18n.t('删除项目')}：${name}？`
        result = await this.$confirm(message, title, {
          customClass: 'project-handle-dialog',
          dangerouslyUseHTMLString: true,
          confirmButtonClass: 'confirm-button--danger',
          confirmButtonText: i18n.t('仍要删除'),
          cancelButtonText: i18n.t('取消'),
        })
      } catch (_) {
        result = false
      }
      return result
    },
    // 结束项目
    async endProject(info) {
      const confirmResult = await this.confirmBeforeOperate(
        `${i18n.t('确认结束项目')}-${info.name}-${i18n.t('吗')}？${i18n.t(
          '结束项目后不允许再创建需求、任务、迭代、缺陷等功能',
        )}`,
      )

      if (!confirmResult) {
        return false
      }
      this.loading = true
      const result = await projectListService.completeProject({
        id: info.id,
        projectId: info.id,
      })

      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('结束成功'),
          type: 'success',
        })

        this.getProjectList()
      } else {
        // this.$message({ message: result.msg || "结束失败", type: 'error' })
      }
    },
    // 删除项目
    async deleteProject(info) {
      const confirmResult = await this.confirmDeleteProject(info.name)

      if (!confirmResult) {
        return false
      }
      this.loading = true
      const result = await projectListService.deleteProject({
        id: info.id,
        projectId: info.id,
      })

      this.loading = false
      if (result.status === 200) {
        this.$message({
          message: result.msg || i18n.t('删除成功'),
          type: 'success',
        })

        this.pagainationChange(1)
        this.$store.dispatch({ type: 'getProjectListAll' })
      } else {
        // this.$message({ message: result.msg || "删除失败", type: 'error' })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.page-content-box-width {
  border-right: 0;
  border-width: 0;
  height: 100%;
  /deep/ .el-card__body {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
.opreatebtns {
  > button {
    margin-left: 0;
  }

  > button:last-child {
    margin-right: 0;
  }
}
.project-list {
  // position: absolute;
  background-color: #ffffff;
  //top: 0;
  //right: 0;
  //bottom: 0;
  //left: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  //min-width: 1200px;
  //min-height: calc(100vh - 64px);
  //margin: auto;
  box-sizing: border-box;
  transition: all 0.12s ease, 0.12s ease;
  .mine-content {
    //padding: 24px;
    height: 100%;
  }
}
.table-box-top {
  flex: 1;
  overflow: hidden;
  .demoProj {
    font-size: 12px;
    color: $demoProListColor;
    background: $demoProBackground;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 5px;
    border: $demoProListBor;
  }
}
.create-tips {
  display: inline-block;
}
.project__head {
  display: flex;
  margin: 0 0 22px;
  font-size: 20px;
  color: #000000;
  line-height: 22px;
  font-weight: normal;
  justify-content: space-between;
  .search-creeate-manage-wrapper {
    flex: 0 0 430px;
    position: relative;
  }
  .search-creeate-manage-wrapper-english {
    flex: 0 0 502px;
  }
}
.header-filter-btn-box {
  .header-filter-btn {
    margin-left: 10px;
    font-size: 14px;
    cursor: pointer;
  }
}

.opreatebtns {
  span {
    display: inline-block;
    padding: 0 2px;
    color: #2196f3;
    cursor: pointer;

    &:hover {
      color: #0880e0;
    }
  }
}
.list-table {
  height: calc(100% - 40px);
  border-width: 0;
  display: flex;
  flex-direction: column;
  /deep/ .el-table__body-wrapper {
    overflow-y: auto;
  }
}
// 分页
.table-box-footer {
  display: flex;
  justify-content: flex-end;
  padding: 4px 0 4px 2px;
}

.addclassTap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.el-input__icon {
  cursor: pointer;
}

.project-filter-input {
  /deep/ .el-input__inner {
    padding-right: 30px !important;
  }
}
.dialog-table {
  /deep/ .el-table__body {
    td {
      padding: 9px 0;
      border-bottom-color: #eeeeee;
    }
  }
}
</style>
