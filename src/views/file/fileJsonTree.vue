<template>
  <div class="file-box-tree">
    <el-tree
      v-loading="loading"
      :data="jsonTreeData"
      :props="defaultProps"
      :default-expand-all="false"
      :expand-on-click-node="false"
      @node-click="HandleNode"
    >
      <div slot-scope="scope">
        <div>
          <!-- 类型为array时子参数名禁止操作 -->
          <el-input
            v-model="scope.data.fieldName"
            style="width: 13vw;"
            :placeholder="$t('参数名称')"
            :disabled="
              jsonTreeData[0].$treeNodeId == scope.data.$treeNodeId ||
                scope.node.parent.data.type == 'array'
            "
            @change="checkEdit"
          >
          </el-input>
          <el-checkbox
            v-model="scope.data.required"
            true-label="1"
            false-label="0"
            :checked="scope.data.required ? true : false"
            @change="checkEdit"
          >
          </el-checkbox>
          <el-select
            v-model="scope.data.type"
            style="width:13vw;"
            @change="sendParamBtn(scope)"
          >
            <el-option
              v-for="item in sendBodyList"
              :key="item.key"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <!-- 类型为array&objec时mock不可选 -->
          <el-select
            v-model="scope.data.mock.mock"
            :disabled="
              scope.data.type == 'object' || scope.data.type == 'array'
            "
            style="width:13vw;"
            @change="checkEdit"
          >
            <el-option
              v-for="item in mockList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>

          <!-- <el-input v-model="scope.data.example" style="width:26%;" placeholder="mock" ></el-input> -->
          <el-input
            v-model="scope.data.description"
            style="width:26%;"
            :placeholder="$t('备注')"
            @change="checkEdit"
          >
            <!-- <i slot="suffix" class="el-icon-setting" @click="remarkBtn(scope)"></i> -->
          </el-input>
          <!-- <i class="el-icon-setting table-input-edit-icon" style='width:20px'  @click="setParamBtn(scope)"></i> -->
          <i
            v-if="deleChildShow(scope)"
            class="el-icon-delete cursor-pointer"
            style="width:20px"
            @click="deleteParamBtn(scope)"
          ></i>
          <i
            v-if="showBrother(scope)"
            class="el-icon-plus cursor-pointer"
            style="width:20px"
            :title="$t('添加兄弟节点')"
            @click="addBrotherBtn(scope)"
          ></i>
          <div v-if="showBroChild(scope)" class="el-icon-plus-box">
            <el-popover
              placement="right"
              width="20"
              trigger="hover"
              popper-class="el-icon-plus-box-hover"
            >
              <div class="el-icon-plus-box-hover" style="width:100%;">
                <div
                  class="cursor-pointer file-plus-hover"
                  @click="addBrotherBtn(scope)"
                >
                  {{ $t('兄弟节点') }}
                </div>
                <div
                  class="cursor-pointer file-plus-hover"
                  @click="addChildBtn(scope)"
                >
                  {{ $t('子节点') }}
                </div>
              </div>
              <i
                slot="reference"
                class="el-icon-plus cursor-pointer"
                style="width:20px"
                title="添加兄弟节点/子节点"
              ></i>
            </el-popover>
          </div>
          <i
            v-if="showChild(scope)"
            class="el-icon-plus cursor-pointer"
            style="width:20px"
            :title="$t('添加子节点')"
            @click="addChildBtn(scope)"
          ></i>
        </div>
        <span v-if="scope.data.fieldName == ''" style="color:red;"
          >{{ $t('请输入参数值') }}!</span
        >
      </div>
    </el-tree>
    <!-- 备注 -->
    <el-dialog
      :title="$t('备注')"
      :visible.sync="remarkshow"
      width="24%"
      :close-on-click-modal="false"
    >
      <div class="date-container">
        <div class="data-left m10">
          <el-input
            v-model="remarkParam"
            placeholder="name:string"
            type="textarea"
          ></el-input>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="remarkshow = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="remarkConfirmBtn">{{
          $t('确定')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import fileMixin from './fileMixin.js'
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'FileJsonTree',
  mixins: [fileMixin],
  props: {
    jsondata: {
      type: [Object, Array],
      default: null,
    },
  },
  data() {
    return {
      // activeName2: 'first',
      defaultProps: {
        children: 'properties',
      },

      loading: true,
      jsonTreeData: [
        {
          fieldName: 'root',
          type: 'object',
          required: 0,
          label: 'root',
          mock: { mock: '' },
          description: '',
          properties: [],
        },
      ],

      remarkshow: false,
      remarkParam: '',
      count: 0,
      publicRemark: null,
      rootAddshow: false, //标记root是否需要展示添加
    }
  },
  computed: {
    ...mapState({
      detailShow: state => state.fe.detailShow,
      interfaceUrlList: state => state.fe.interfaceUrlList,
      sendBodyList: state => state.fe.sendBodyList,
      mockList: state => state.fe.mockList,
    }),
  },

  watch: {
    jsondata: function() {
      this.jsonTreeData = this.jsondata
      this.loading = false
    },
  },

  updated() {},
  mounted() {
    this.jsonTreeData = this.jsondata
    this.loading = false
  },
  methods: {
    ...mapMutations(['editShowFun']),
    //json-tree
    HandleNode() {},
    //json-tree 类型下拉改动时
    sendParamBtn(scope) {
      if (scope.data.type == 'array') {
        scope.data.properties = []
        scope.data.properties.push({
          fieldName: 'items',
          type: 'string',
          required: 1,
          mock: { mock: '' },
          description: '',
          properties: [],
        })
      } else {
        scope.data.properties = []
      }
      let flag = this.jsonTreeData[0].$treeNodeId
      // console.log('id:+++',this.jsonTreeData[0].$treeNodeId,scope.data)
      if (flag == scope.data.treeNodeId) {
        this.rootAddshow = true
      } else {
        this.rootAddshow = false
      }
      this.checkEdit()
    },
    //json-tree 设置
    setParamBtn() {},
    //删除图标显示
    deleChildShow(scope) {
      let data = scope.data,
        node = scope.node
      let flag = this.jsonTreeData[0].$treeNodeId
      if (node.parent.data.type !== 'array' && flag !== data.$treeNodeId) {
        return true
      }
    },
    //兄弟添加show
    showBrother(scope) {
      let data = scope.data,
        node = scope.node
      let flag = this.jsonTreeData[0].$treeNodeId
      if (data.$treeNodeId !== flag && node.parent.data.type == 'array') {
        return false
      }
      if (data.$treeNodeId !== flag && data.type !== 'object') {
        return true
      }
    },
    //添加兄弟节点
    addBrotherBtn(scope) {
      let data = scope.data,
        node = scope.node
      if (data.fieldName == '') {
        return false
      }
      this.count++
      node.parent.data.properties.push({
        fieldName: 'field_' + this.count,
        type: 'string',
        required: 1,
        mock: { mock: '' },
        description: '',
        properties: [],
      })
    },
    //兄弟&子节点添加
    showBroChild(scope) {
      let data = scope.data,
        node = scope.node
      let flag = this.jsonTreeData[0].$treeNodeId
      if (node.parent.data.length > 0) {
        if (
          node.parent.data[0].type == 'array' &&
          data.type == 'object' &&
          node.parent.data[0].$treeNodeId == flag
        ) {
          return false
        }
      }
      if (
        node.parent.data.type == 'array' &&
        data.type == 'object' &&
        data.$treeNodeId == flag
      ) {
        return false
      }
      if (
        data.$treeNodeId !== flag &&
        data.type == 'object' &&
        node.parent.data.type !== 'array'
      ) {
        return true
      }
    },
    //子节点添加show
    showChild(scope) {
      let data = scope.data,
        node = scope.node
      let flag = this.jsonTreeData[0].$treeNodeId
      if (node.parent.data.length > 0) {
        if (
          node.parent.data[0].type == 'array' &&
          data.type == 'object' &&
          node.parent.data[0].$treeNodeId == flag
        ) {
          return true
        }
      }
      if (
        node.parent.data.type == 'array' &&
        data.type == 'object' &&
        node.parent.data.$treeNodeId == flag
      ) {
        return true
      }
      if (this.rootAddshow) {
        return false
      }
      if (data.type == 'object' && data.$treeNodeId == flag) {
        return true
      }
      if (
        data.$treeNodeId !== flag &&
        data.type == 'object' &&
        node.parent.data.type == 'array'
      ) {
        return true
      }
    },
    //子节点添加
    addChildBtn(scope) {
      let data = scope.data,
        node = scope.node
      if (data.fieldName == '') {
        return false
      }
      this.count++
      data.properties.push({
        fieldName: 'field_' + node.id + this.count,
        type: 'string',
        required: 1,
        mock: { mock: '' },
        description: '',
        properties: [],
      })
    },
    //json-tree 删除
    deleteParamBtn(scope) {
      const parent = scope.node.parent
      const properties = parent.data.properties || parent.data
      const index = properties.findIndex(
        d => d.$treeNodeId === scope.data.$treeNodeId,
      )

      properties.splice(index, 1)
    },
    //备注编辑
    remarkBtn(scope) {
      this.remarkshow = true
      this.publicRemark = scope
    },
    //备注数据
    remarkData() {},
    //备注确认
    remarkConfirmBtn() {
      this.publicRemark.data.remark = this.remarkParam
      this.remarkshow = false
    },
  },
}
</script>

<style lang="scss" scoped>
.file-box {
  position: relative;
  min-width: 910px;
  overflow-x: auto;
}
.file-plus-hover {
  // background: #d5ebfc;
  padding: 5px 0;
  &:hover {
    background: #d5ebfc;
  }
}
.el-icon-plus-box {
  width: 30px;
  .el-icon-plus-box-hover {
    width: 70px !important;
    //  background: #d5ebfc;
    div {
      padding: 5px 0;
      &:hover {
        background: #d5ebfc;
      }
    }
    //  .el-popover{
    //    min-width: 70px;
    //  }
  }
}
</style>
