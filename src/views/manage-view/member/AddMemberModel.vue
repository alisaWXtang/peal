<template>
  <el-dialog
    :title="$t('添加成员')"
    width="840px"
    :visible.sync="showDialog"
    destroy-on-close
    class="add-member"
    :close-on-click-modal="false"
    @closed="manageModelClosed"
  >
    <div v-loading="showLoading" class="member-box">
      <div v-loading="searchLoading" class="flex member-box-left">
        <el-input
          v-model.trim="keywords"
          :placeholder="$t('搜索关键字')"
          size="small"
          maxlength="30"
          @input="handleInput"
        >
          <!-- <i slot="suffix" class="el-input__icon el-icon-search pointer" @click.stop="searchGroupPerson"></i> -->
        </el-input>
        <ul>
          <li v-for="(item, index) in displayList" :key="item.userId">
            <p :title="item.userName + '(' + item.userId + ')'">
              {{ item.userName + '(' + item.userId + ')' }}
            </p>
            <span
              ><el-checkbox
                :disabled="item.admin"
                :value="item.checked"
                @change="selectPerson($event, index)"
              ></el-checkbox
            ></span>
          </li>
        </ul>
      </div>
      <div class="line"></div>
      <div class="flex member-box-right">
        <div>
          {{ $t('已选成员') }}({{
            Array.isArray(rightList) ? rightList.length : 0
          }})
        </div>
        <ul>
          <li v-for="(item, index) in rightList" :key="item.id">
            <p :title="item.userName + '(' + item.userId + ')'">
              {{ item.userName + '(' + item.userId + ')' }}
            </p>
            <i
              class="el-icon-close"
              :class="{ notallow: item.admin }"
              @click="item.admin ? '' : removePerson(index)"
            ></i>
          </li>
        </ul>
      </div>
    </div>
    <div class="member-footer">
      <el-button size="small" @click="showDialog = false">{{
        $t('取消')
      }}</el-button>
      <el-button type="primary" size="small" @click="sureModel">{{
        $t('确定')
      }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 管理者视图，添加成员
 * @desc 添加成员弹窗
 * @author lili
 * @date 2020.4.16
 */
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import CONSTVARLIABLE from '@/store/mutation-types'
export default {
  name: 'AddMemberModel',
  props: {
    leftList: {
      type: Array,
      required: true,
      desc: '弹窗左侧列表值',
    },

    rightList: {
      type: Array,
      required: true,
      desc: '弹窗右侧列表值',
    },

    showModel: {
      type: Boolean,
      required: true,
      default: false,
      desc: '弹窗是否显示',
    },

    showLoading: {
      type: Boolean,
      required: false,
      default: false,
      desc: '是否显示加载动画',
    },
  },

  data() {
    return {
      searchLoading: false, // 搜索显示动画
      showDialog: false,
      keywords: '', // 团队成员搜索关键字
      isSearch: false, // 是否处于搜索状态
      displayList: [], // 成员选择左侧展示列表
    }
  },

  watch: {
    showModel(val) {
      this.showDialog = val
    },
    leftList(val) {
      this.displayList = val
    },
  },
  created() {},
  methods: {
    // 团队成员搜索
    async searchGroupPerson(keyword) {
      let res = await this.$store.dispatch('getSearchPerson', {
        keyword,
      })

      this.isSearch = true
      if (res && res.length > 0) {
        this.displayList = res
      } else {
        this.displayList = []
        this.$message({
          type: 'warning',
          message: i18n.t('没有搜索到相关人员'),
        })
      }
      this.searchLoading = false
    },
    // 成员搜索框失去焦点
    handleInput: debounce(function(val) {
      if (val) {
        this.searchLoading = true
        this.searchGroupPerson(val)
      } else {
        this.displayList = this.leftList
        this.isSearch = false
      }
    }, 300),
    // 选择团队成员
    selectPerson($event, index) {
      let unSelectList = this.displayList
      let list = cloneDeep(this.rightList)
      unSelectList[index].checked = $event
      if ($event) {
        list.unshift(unSelectList[index])
      } else {
        for (let i = 0; i < list.length; i++) {
          if (list[i].userId === unSelectList[index].userId) {
            list.splice(i, 1)
            break
          }
        }
      }
      !this.isSearch &&
        this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_UNSELECTED, {
          list: unSelectList,
        })

      this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_SELECTED, {
        list,
      })
    },
    // 删除团队成员
    removePerson(index) {
      let unSelectList = this.displayList
      let selectList = cloneDeep(this.rightList)
      for (let i = 0; i < unSelectList.length; i++) {
        if (unSelectList[i].userId === selectList[index].userId) {
          unSelectList[i].checked = false
          break
        }
      }
      selectList.splice(index, 1)
      !this.isSearch &&
        this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_UNSELECTED, {
          list: unSelectList,
        })

      this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_SELECTED, {
        list: selectList,
      })
    },
    // 关闭添加成员弹窗
    manageModelClosed() {
      this.keywords = ''
      this.isSearch = false
      this.displayList = []
      this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_UNSELECTED, {
        list: [],
      })

      this.$store.commit(CONSTVARLIABLE.UPDATE_MANAGEVIEW_MEMBER_SELECTED, {
        list: [],
      })

      this.$emit('update:showModel', false)
    },
    sureModel() {
      this.$emit('submitModel')
    },
  },
}
</script>
<style lang="scss" scoped>
.add-member {
  .member-box {
    display: flex;
    align-items: flex-end;
    padding: 0 10px;
    .flex {
      flex: 1;
      flex-shrink: 0;
      overflow: hidden;
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
            flex: 1 0;
            margin: 0;
            padding: 0 10px 0 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          span,
          i {
            flex-shrink: 0;
            margin-right: 5px;
          }
          i {
            cursor: pointer;
            &.notallow {
              cursor: not-allowed;
              color: #999;
            }
          }
        }
      }
    }
    .line {
      flex-shrink: 0;
      width: 1px;
      height: 280px;
      background-color: #e5e5e5;
    }
    .member-box-left {
      padding-right: 20px;
      /deep/ .el-input__inner {
        border: 1px solid #e5e5e5 !important;
      }
      .pointer {
        cursor: pointer;
      }
    }
    .member-box-right {
      padding-left: 20px;
      div {
        height: 32px;
        line-height: 32px;
      }
    }
  }
}
.member-footer {
  margin-top: 40px;
  text-align: center;
}
</style>
