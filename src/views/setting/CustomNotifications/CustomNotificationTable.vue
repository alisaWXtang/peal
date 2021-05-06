<template>
  <div class="notification-table-wrap">
    <div v-if="createAuth" class="create-wrap">
      <div class="create-btn cursor-pointer" @click="createNotification">
        +{{ $t('创建新通知') }}
      </div>
    </div>
    <co-table :data="notificationList" style="width: 100%">
      <co-table-column :label="$t('事件')" min-width="240">
        <template slot-scope="scope">
          <div v-if="scope.row.isNewAdd" new-create-wrap>
            <el-select
              v-model="scope.row.event"
              :placeholder="$t('事件')"
              class="select-public"
            >
              <el-option
                v-for="item in eventsList"
                :key="item.event"
                :disabled="item.disabled"
                :label="item.eventName"
                :value="item.event"
              ></el-option>
            </el-select>
          </div>
          <div
            v-else
            class="options-wrap"
            @mouseenter="mouseenter(scope.row, fieldType.event)"
            @mouseleave="mouseleave(scope.row, fieldType.event)"
          >
            <span
              v-show="scope.row.selectShow.eventShow"
              class="display-font"
              >{{ scope.row.event.eventName }}</span
            >
            <el-select
              v-show="!scope.row.selectShow.eventShow"
              v-model="scope.row.event.event"
              :placeholder="$t('事件')"
              class="select-public"
              @visible-change="
                changeVisible($event, scope.row, fieldType.event)
              "
            >
              <el-option
                v-for="item in eventsList"
                :key="item.event"
                :label="item.eventName"
                :value="item.event"
                :disabled="item.disabled"
              ></el-option>
            </el-select>
          </div>
        </template>
      </co-table-column>
      <co-table-column :label="$t('接收人')" min-width="300">
        <template slot-scope="scope">
          <div v-if="scope.row.isNewAdd" new-create-wrap>
            <el-select
              v-model="scope.row.defaultOptions"
              :placeholder="$t('接收人')"
              class="select-public"
              multiple
            >
              <el-option-group
                v-for="group in receiverTarget"
                :key="group.label"
                :label="group.label"
              >
                <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-option-group>
            </el-select>
          </div>
          <div
            v-else
            class="options-wrap"
            @mouseenter="mouseenter(scope.row, fieldType.receivers)"
            @mouseleave="mouseleave(scope.row, fieldType.receivers)"
          >
            <span
              v-show="scope.row.selectShow.receivers"
              class="display-font"
              >{{ displayMultipleName(scope.row.receiversFieldValue) }}</span
            >

            <el-select
              v-show="!scope.row.selectShow.receivers"
              v-model="scope.row.defaultOptions"
              :placeholder="$t('接收人')"
              class="select-public"
              multiple
              @visible-change="
                changeVisible($event, scope.row, fieldType.receivers)
              "
              @remove-tag="removeTag(scope.row, fieldType.receivers)"
            >
              <el-option-group
                v-for="group in receiverTarget"
                :key="group.label"
                :label="group.label"
              >
                <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-option-group>
            </el-select>
          </div>
        </template>
      </co-table-column>
      <co-table-column :label="$t('接收方式')" min-width="150">
        <template slot-scope="scope">
          <div v-if="scope.row.isNewAdd" new-create-wrap>
            <el-select
              v-model="scope.row.methods"
              :placeholder="$t('接收方式')"
              class="select-public"
              multiple
            >
              <el-option
                v-for="item in methodFields"
                :key="item.methodId"
                :label="item.methodName"
                :value="item.methodId"
              ></el-option>
            </el-select>
          </div>
          <div
            v-else
            class="options-wrap"
            @mouseenter="mouseenter(scope.row, fieldType.methods)"
            @mouseleave="mouseleave(scope.row, fieldType.methods)"
          >
            <span v-show="scope.row.selectShow.methods" class="display-font">{{
              displayMultipleName(scope.row.methodsValue)
            }}</span>
            <el-select
              v-show="!scope.row.selectShow.methods"
              v-model="scope.row.methodsKey"
              :placeholder="$t('接收方式')"
              class="select-public"
              multiple
              @visible-change="
                changeVisible($event, scope.row, fieldType.methods)
              "
              @remove-tag="removeTag(scope.row, fieldType.methods)"
            >
              <el-option
                v-for="item in methodFields"
                :key="item.methodId"
                :label="item.methodName"
                :value="item.methodId"
              ></el-option>
            </el-select>
          </div>
        </template>
      </co-table-column>
      <co-table-column :label="$t('操作')" min-width="100">
        <template slot-scope="scope">
          <div v-if="scope.row.isNewAdd">
            <span
              class="cursor-pointer c-blue"
              @click="createHandle(scope.row)"
              >{{ $t('新建') }}</span
            >
            <span class="cursor-pointer c-blue" @click="cancelCreate">{{
              $t('取消')
            }}</span>
          </div>
          <div v-else class="delete">
            <i
              v-if="scope.row.deletable && deleteAuth"
              class="el-icon-delete delete-icon"
              @click="deleteNotification(scope.row.id)"
            ></i>
          </div>
        </template>
      </co-table-column>
    </co-table>
  </div>
</template>
<script>
import { i18n } from '@/i18n'
/**
 * @title 通知列表通用表格
 * @desc 需求,任务，缺陷的通用表格组件组件
 * @author wangling
 * @date 2020.05.08
 */
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import ACTIONCONSTVARLIABLE from '@/store/action-types'
import MUTATIONCONSTVARLIABLE from '@/store/mutation-types'

const creatInitData = {
  isNewAdd: true,
  event: '',
  receivers: {
    fields: [],
    users: [],
  },

  methods: [],
}

export default {
  name: 'CustomNotificationTable',
  components: {},
  mixins: [],
  props: {
    workItemType: {
      type: [Number, String],
      required: true,
      desc: '工作项类型数字：需求 1, 任务 2, 缺陷 3',
    },

    workItemName: {
      type: String,
      required: true,
      desc: '工作项类型英文：需求 require, 任务  task, 缺陷 bug',
    },
  },

  data() {
    return {
      createInit: {
        ...cloneDeep(creatInitData),
        projectId: this.$getUrlParams().projectId,
        workItemType: this.workItemType,
      },

      projectId: this.$getUrlParams().projectId,
      isOptionVisble: false, //是否有下拉框显示
      currentSelectVisible: {
        id: '', //下拉框显示事件id号
        type: '', //下拉框显示类型(事件，接收人，接收方式，操作)
      },
      notificationList: [], //通知列表
      fieldType: {
        //类型有事件，接收人，接收方式，主要用来显示文字或者select下拉框
        event: 'event',
        receivers: 'receivers',
        methods: 'methods',
      },

      eventsList: [], //事件下拉框列表,
    }
  },
  computed: {
    // 接收人/接收方法 展示方式
    displayMultipleName() {
      return function(arr) {
        return arr.join('/')
      }
    },
    // 获取 通知列表
    getNotificationList() {
      const data = this.$store.state.notificationsSetting
        .customNotificatainsList[this.workItemName].seletionList

      data.forEach(element => {
        const options = []

        Array.isArray(element.receivers.fields) &&
          element.receivers.fields.forEach(item => {
            options.push(item.attrName)
          })

        Array.isArray(element.receivers.roles) &&
          element.receivers.roles.forEach(obj => {
            options.push(obj.roleId)
          })

        element.defaultOptions = options
      })

      return data
    },
    // 获取事件 下拉框列表
    eventFieldsList() {
      return this.$store.state.notificationsSetting.customNotificatainsList[
        this.workItemName
      ].eventFields
    },
    // 获取接收事件 下拉框列表
    methodFields() {
      return this.$store.state.notificationsSetting.customNotificatainsList[
        this.workItemName
      ].methodFields
    },
    createAuth() {
      return this.getAuthByType('FUNC_COOP_NOTIFICATION_SETTINGS_ADD')
    },
    updateAuth() {
      return this.getAuthByType('FUNC_COOP_NOTIFICATION_SETTINGS_UPDATE')
    },
    deleteAuth() {
      return this.getAuthByType('FUNC_COOP_NOTIFICATION_SETTINGS_DELETE')
    },
    loading() {
      return this.$store.state.notificationsSetting.loading
    },
    receiverTarget() {
      const options = [
        {
          label: i18n.t('按人员字段'),
          options: [],
        },

        {
          label: i18n.t('按项目角色'),
          options: [],
        },
      ]

      const fields =
        this.$store.state.notificationsSetting.customNotificatainsList[
          this.workItemName
        ].receiverFields.fields || []
      const roles =
        this.$store.state.notificationsSetting.customNotificatainsList[
          this.workItemName
        ].receiverFields.roles || []

      fields.forEach(item => {
        options[0].options.push({
          label: item.fieldName,
          value: item.attrName,
        })
      })

      roles.forEach(item => {
        options[1].options.push({
          label: item.roleName,
          value: item.roleId,
        })
      })

      return options
    },
  },

  watch: {
    getNotificationList(newValue) {
      this.notificationList = this.formatNotificationsList(cloneDeep(newValue))
      this.addDisabledAttr()
    },
    eventFieldsList(newValue) {
      this.eventsList = cloneDeep(newValue)
    },
    notificationList: {
      handler() {
        this.addDisabledAttr()
      },
      deep: true,
    },
  },

  mounted() {
    this.notificationList = this.formatNotificationsList(
      cloneDeep(this.getNotificationList),
    )

    this.eventsList = cloneDeep(this.eventFieldsList)
    this.addDisabledAttr()
  },
  methods: {
    getAuthByType(type) {
      return this.$authFunction(type, 3, this.projectId)
    },
    formatNotificationsList(seletionList) {
      seletionList = seletionList?.map(item => {
        let [
          receiversFieldKey,
          receiversFieldValue,
          methodsKey,
          methodsValue,
        ] = [[], [], [], []]
        // receiversFieldKey:接收人id数组  receiversFieldValue接收人显示名字数组
        item?.receivers?.fields?.forEach(item => {
          receiversFieldKey.push(item.attrName)
          receiversFieldValue.push(item.fieldName)
        })
        item?.receivers?.roles?.forEach(item => {
          receiversFieldKey.push(item.roleId)
          receiversFieldValue.push(item.roleName)
        })
        // methodsKey:接收方式id数组  methodsValue:接收方式显示名字数组
        item?.methods.forEach(item => {
          methodsKey.push(item.methodId)
          methodsValue.push(item.methodName)
        })

        let selectShow = {
          eventShow: true, //事件select
          receivers: true, //接收人select
          methods: true, //接收方式select
        }
        // 点击标签关闭时，不关闭弹窗
        if (item.id === this.currentSelectVisible.id) {
          selectShow = this.setSelectShow(
            selectShow,
            this.currentSelectVisible.type,
          )
        }

        return {
          ...item,
          // 控制事件，接收人，接收方式的显示，不能单独写一个，写一个当鼠标移上去时，一排全部都会展开
          selectShow,
          receiversFieldKey,
          receiversFieldValue,
          methodsKey,
          methodsValue,
        }
      })
      this.$nextTick(() => {
        this.$store.commit(
          MUTATIONCONSTVARLIABLE.UPDATE_NOTIFICATIONS_LOADING,
          false,
        )
      })
      return seletionList
    },
    // 给事件下拉框列表添加disabled属性
    addDisabledAttr() {
      const selectionList = this.notificationList.map(item => {
        // 新建通知存在时，也需要添加进去
        if (item.isNewAdd && item.event) {
          return item.event
        }
        return item.event.event
      })
      this.eventsList = this.eventsList.map(item => {
        return {
          ...item,
          disabled: selectionList.includes(item.event),
        }
      })
    },
    resetIninCreate() {
      this.createInit = {
        ...cloneDeep(creatInitData),
        projectId: this.$getUrlParams().projectId,
        workItemType: this.workItemType,
      }
    },
    // 点击 创建新通知按钮创建通知
    createNotification() {
      if (this.notificationList[0]?.isNewAdd) {
        this.$message({
          message: i18n.t('一次只能创建一条通知'),
          type: 'warning',
        })

        return
      }
      this.notificationList.unshift(this.createInit)
    },
    //点击 新建按钮
    createHandle(row) {
      this.currentSelectVisible.id = ''
      this.currentSelectVisible.type = ''
      // 事件,接收人，接收方式为必填
      if (!row.event || !row.methods.length || !row.defaultOptions.length) {
        this.$message({
          type: 'error',
          message: i18n.t('请选择相应的事件/接收人/接收方式'),
        })

        return
      }

      const fields = []
      const roleIds = []
      row.defaultOptions.forEach(element => {
        if (Object.prototype.toString.call(element) === '[object String]') {
          fields.push(element)
        } else {
          roleIds.push(element)
        }
      })

      this.$store.dispatch(ACTIONCONSTVARLIABLE.CREATE_NOTIFICATIONS, {
        payload: {
          ...row,
          receivers: {
            fields: fields,
            users: [],
            roles: roleIds,
          },
        },
      })

      // 清除上一次新建的选项
      this.resetIninCreate()
    },
    // 点击取消  取消创建
    cancelCreate() {
      this.notificationList.shift()
      this.resetIninCreate()
    },
    changeVisible(visible, row, type) {
      this.isOptionVisble = visible
      this.currentSelectVisible.id = row.id
      this.currentSelectVisible.type = type
      this.mouseleave(row, type)
      // 关闭下拉框时，检查是否需要更新,发送更新请求
      if (!visible && this.isNeedUpdate(row)) {
        this.currentSelectVisible.id = ''
        this.currentSelectVisible.type = ''
        this.updateNotfication(row)
      }
    },

    /*
     * @Description: 是否需要更新通知
     * @Param: row：当前行最新数据
     * @Return Boolean: true为更新，false为不更新
     */
    isNeedUpdate(row) {
      const event = row.event.event
      const receivers = row.defaultOptions
      const methods = row.methodsKey
      // 找到原始数据对比有改动没，有改动就更新，没改动就不更新
      const originNotificationList = this.formatNotificationsList(
        this.getNotificationList,
      )

      const findCurrenNotification = originNotificationList.find(
        item => item.id === row.id,
      )

      const originEvent = findCurrenNotification?.event?.event
      const originReceivers = findCurrenNotification?.defaultOptions
      const originMethods = findCurrenNotification?.methodsKey

      const withoutChange =
        isEqual(event, originEvent) &&
        isEqual(receivers, originReceivers) &&
        isEqual(methods, originMethods)
      return !withoutChange
    },
    // 点击下拉框多选x时，发送更新请求
    removeTag(row, type) {
      this.currentSelectVisible.id = row.id
      this.currentSelectVisible.type = type
      // 需要对比下是否需要更新，如果在下拉框选中 排除点标签叉关闭时也会更新的情况
      this.isNeedUpdate(row) && this.updateNotfication(row)
    },
    // 发送更新请求
    async updateNotfication(row) {
      const fields = []
      const roleIds = []
      row.defaultOptions.forEach(element => {
        if (Object.prototype.toString.call(element) === '[object String]') {
          fields.push(element)
        } else {
          roleIds.push(element)
        }
      })

      const result = await this.$store.dispatch(
        ACTIONCONSTVARLIABLE.UPDATE_NOTIFICATIONS,
        {
          payload: {
            id: row.id,
            projectId: this.projectId,
            workItemType: this.workItemType,
            event: row.event.event,
            receivers: {
              fields: fields,
              users: [],
              roles: roleIds,
            },

            methods: row.methodsKey,
          },
        },
      )

      // 解决当删除最后一个接受方式挥着接收人时，列表不会更新问题
      if (result.status !== 200) {
        this.notificationList = this.formatNotificationsList(
          cloneDeep(this.getNotificationList),
        )
      }
    },
    mouseenter(row, type) {
      // 有编辑权限才能编辑
      if (row.editable && this.updateAuth) {
        this.notificationList = this.notificationList.map(item => {
          // 把当前移入的id的（事件,接收人，接收方式）其中一种的select置为false(显示出来)
          if (item.id === row.id) {
            const selectShow = this.setSelectShow(item.selectShow, type)
            return {
              ...item,
              selectShow,
            }
          }
          return item
        })
      }
    },
    /*
     * @Description: 主要是把type类型的select 置为false 显示出来
     * @Return: Object
     */
    setSelectShow(selectShow, type, value = false) {
      let selectShowObj = selectShow
      switch (type) {
        case 'event':
          selectShowObj.eventShow = value
          break
        case 'receivers':
          selectShowObj.receivers = value
          break
        case 'methods':
          selectShowObj.methods = value
          break
      }

      return selectShowObj
    },
    mouseleave(row, type) {
      if (!this.isOptionVisble) {
        this.currentSelectVisible.id = ''
        this.currentSelectVisible.type = ''
      }
      const typeMenu = {
        event: 'eventShow',
        receivers: 'receivers',
        methods: 'methods',
      }

      this.notificationList = this.notificationList.map(item => {
        // 比如事件下拉框展开情况下,移入接收人在移除，只需要把当前移除的状态变为true即可
        if (item.id === this.currentSelectVisible.id) {
          item.selectShow[typeMenu[type]] =
            type === this.currentSelectVisible.type
              ? !this.isOptionVisble
              : true
          return item
        } else {
          return {
            ...item,
            selectShow: {
              eventShow: true, //事件select
              receivers: true, //接收人select
              methods: true, //接收方式select
            },
          }
        }
      })
    },
    // 删除通知
    deleteNotification(id) {
      this.currentSelectVisible.id = ''
      this.currentSelectVisible.type = ''
      this.$confirm(i18n.t('确定删除通知吗?'), i18n.t('删除提示'), {
        type: 'warning',
      })
        .then(() => {
          this.$store.dispatch(ACTIONCONSTVARLIABLE.DELETE_NOTIFICATIONS, {
            payload: {
              projectId: this.projectId,
              workItemType: this.workItemType,
              id,
            },
          })
        })
        .catch(() => {})
    },
  },
}
</script>
<style lang="scss" scoped>
$table-padding-left: 7px;
.notification-table-wrap {
  .create-wrap {
    margin-bottom: 16px;
    display: flex;
  }
  .create-btn {
    color: $--color-primary;
    font-size: 14px;
    font-weight: 700;
  }
  .options-wrap {
    padding: 2px 0;
    .display-font {
      min-height: 32px;
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 1px 30px 0 $table-padding-left;
      border: 1px solid transparent;
    }
    .select-public {
      width: 100%;
      /deep/.el-select__tags {
        padding-left: 0;
      }
    }
  }
  .delete {
    padding-left: $table-padding-left;
    .delete-icon:hover {
      cursor: pointer;
    }
  }
}
</style>
