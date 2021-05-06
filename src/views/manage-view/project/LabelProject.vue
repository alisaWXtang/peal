<template>
  <co-dialog
    v-loading="loading"
    :title="$t('选择项目')"
    width="600px"
    :visible.sync="currentVisible"
    close-on-click-modal
    @closed="resetDate"
  >
    <div class="project-box">
      <div class="flex project-box-left">
        <el-input
          v-model.trim="keywords"
          class="project-box-left-filter"
          :placeholder="$t('搜索')"
          size="small"
        ></el-input>
        <ul>
          <li v-for="item in alternativeList" :key="item.id">
            <p class="ellipsis-pure" :title="item.name">{{ item.name }}</p>
            <span
              ><el-checkbox
                :value="item.checked"
                @change="selectProject($event, item)"
              ></el-checkbox
            ></span>
          </li>
        </ul>
      </div>
      <div class="line"></div>
      <div class="flex project-box-right">
        <div>
          {{ $t('已选项目') }}({{
            Array.isArray(selectedList) ? selectedList.length : 0
          }})
        </div>
        <ul>
          <li v-for="item in selectedList" :key="item.id">
            <p class="ellipsis-pure" :title="item.name">{{ item.name }}</p>
            <i class="el-icon-close" @click="removeProject(item)"></i>
          </li>
        </ul>
      </div>
    </div>
    <div slot="footer">
      <co-button size="small" @click="resetDate">{{ $t('取消') }}</co-button>
      <co-button type="primary" size="small" @click="submit">{{
        $t('确定')
      }}</co-button>
    </div>
  </co-dialog>
</template>
<script>
/**
 * @title 标签管理项目
 * @desc
 * @author heyunjiang
 * @date 2020.4.16
 */
export default {
  name: 'LabelProject',
  components: {},
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
    },

    id: {
      required: true,
      validator: () => {
        return true
      },
    },
  },

  data() {
    return {
      currentVisible: this.visible,
      loading: false,
      keywords: '',
      selectedList: [], // 已选项目列表
    }
  },
  computed: {
    // 左侧可选列表
    alternativeList() {
      if (this.keywords.length === 0) {
        return this.allProjects
      }
      return this.allProjects.filter(item => item.name.includes(this.keywords))
    },
    ProjectListAll() {
      return this.$store.state.pf.ProjectListAll
    },
    allProjects() {
      const selectedIds = this.selectedList.map(item => item.id)
      return this.ProjectListAll.map(item => ({
        ...item,
        checked: selectedIds.includes(item.id),
      }))
    },
  },

  watch: {
    visible() {
      this.currentVisible = this.visible
      this.initData()
    },
    currentVisible() {
      if (this.currentVisible !== this.visible) {
        this.$emit('update:visible', this.currentVisible)
      }
    },
    id() {
      this.initData()
    },
    ProjectListAll() {
      this.initData()
    },
  },

  created() {},
  mounted() {
    this.initData()
  },
  methods: {
    // 数据初始化
    async initData() {
      if (!this.id) {
        return
      }
      // 获取用户参与的项目列表
      if (!this.allProjects || this.allProjects.length === 0) {
        this.$store.dispatch('getProjectListAll')
        return
      }
      // 获取已经选择的项目列表
      this.selectedList = await this.$store.dispatch(
        'getLabelAllSelectedProjects',
        { id: this.id },
      )
    },
    // 点击确定，更新选择的项目列表
    async submit() {
      this.loading = true
      await this.$store.dispatch('updateLabelAllSelectedProjects', {
        id: this.id,
        list: this.selectedList.map(item => item.id),
      })

      this.resetDate()
    },
    // 数据重置 - 关闭 dialog 时
    resetDate() {
      this.currentVisible = false
      this.loading = false
      this.keywords = ''
      this.selectedList = []
    },
    // 选择/反选项目
    selectProject(seleced, item) {
      if (seleced) {
        this.selectedList.push({ ...item })
      } else {
        this.removeProject(item)
      }
    },
    // 移除项目
    removeProject(item) {
      this.selectedList = this.selectedList.filter(jtem => jtem.id !== item.id)
    },
  },
}
</script>
<style lang="scss" scoped>
.project-box {
  display: flex;
  align-items: flex-end;
  .flex {
    width: 50%;
    flex: 1;
    ul {
      padding: 0 10px 10px;
      height: 260px;
      overflow-y: auto;
      margin-top: 10px;
      li {
        padding: 8px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        p {
          flex: 1;
          margin: 0;
          padding: 0 10px 0 0;
        }
        span,
        i {
          flex-shrink: 0;
          margin-right: 5px;
        }
        i {
          cursor: pointer;
        }
      }
    }
  }
  .line {
    width: 1px;
    height: 280px;
    background-color: #e5e5e5;
  }
  .project-box-left {
    padding-right: 20px;
    .project-box-left-filter {
      width: calc(100% - 20px);
      margin-left: 10px;
    }
    /deep/ .el-input__inner {
      border: 1px solid #e5e5e5 !important;
    }
    .pointer {
      cursor: pointer;
    }
  }
  .project-box-right {
    padding-left: 20px;
    box-sizing: border-box;
    & > div {
      padding-left: 10px;
      height: 32px;
      line-height: 32px;
    }
  }
}
</style>
