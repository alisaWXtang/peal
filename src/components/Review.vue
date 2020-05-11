<template>
  <div class="review-page">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="金渡" name="first">
        <h1>1.数据交互及全选多选思维</h1>
        <table border="1" width="500" align="center" cellspacing="0" cellpadding="6">
          <caption>quanxuan</caption>
          <thead>
            <tr align="center">
              <th>
                <input type="checkbox" v-model="inputAllBox" @change="checkBoxAllFn" />
                {{inputAllBox}}
              </th>
              <th>年龄</th>
              <th>性别</th>
              <th>job</th>
              <th>hobbit</th>
            </tr>
          </thead>
          <tbody>
            <tr align="center" v-for="(item,index) in Lists" :key="index">
              <td>
                <input type="checkbox" v-model="item.inputBox" @change="itemInputFn(item)" />
              </td>
              <td>{{item.age}}</td>
              <td>{{item.sex}}</td>
              <td>{{item.hobbit}}</td>
              <td>
                <button>删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <hr />
        <el-row style="width:70%;" :gutter="20">
          <el-col :span="12">
            <div class="grid-content bg-purple left-part">
              <h1>标签个数（{{tagsprimariy.length}}）/当前选中（{{selectedTags}}）</h1>
              <div class="left-pane">
                <el-tag
                  v-for="item in tagsprimariy"
                  :key="item.name"
                  :type="item.primariyType ? 'warning':''"
                  @click="tagsprimariyFn(item)"
                >{{item.name}}</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-content bg-purple-light right-part">
              <h1>标签个数（{{tags.length}}）</h1>
              <div class="right-pane">
                <el-tag
                  v-for="(item,index) in tags"
                  :key="item.name"
                  closable
                  :type="true ? 'danger':''"
                  @close="tagsFn(item,index)"
                >{{item.name}}</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
        <hr />
        <el-checkbox v-model="checked" @change="checkBoxFn">备选项</el-checkbox>
        <el-popover
          placement="top"
          width="80"
          trigger="manual"
          content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。"
          v-model="checkedPop"
        >你好</el-popover>
        <el-input
          placeholder="请输入内容"
          v-model="input"
          :disabled="!checked"
          style="margin-top:100px;"
        ></el-input>
        <hr />
        <div class="review" style="min-height:100px;">
          <select v-model="privince" @change="privinceFn();cityFn()">
            <option v-for="(item, index) in list" :key="index">
              {{
              item.name
              }}
            </option>
          </select>
          <select v-model="cityinfo" @change="cityFn()">
            <option v-for="(item, index) in city" :key="index">
              {{
              item.name
              }}
            </option>
          </select>
          <select v-model="towninfo" v-if="towninfo">
            <option v-for="(item, index) in town" :key="index">
              {{
              item.name
              }}
            </option>
          </select>
        </div>
        <hr />
        <h1>2.表单动态操作数据交互</h1>
        <h1>用户名：</h1>
        <el-input v-model="userName" placeholder="请输入内容"></el-input>
        <h1>学号：</h1>
        <el-input v-model="userNum" placeholder="请输入内容"></el-input>
        <h1>是否住校：</h1>
        <el-checkbox v-model="isScool"></el-checkbox>
        <h1>信息详情表</h1>
        <el-button type="primary" @click="addSchoolData" :disabled="!userName||!userNum">添加</el-button>
        <el-button type="danger" @click="resetSchoolData">重置</el-button>
        <el-table :data="SchooltableData" style="width: 100%">
          <el-table-column label="姓名" width="180">
            <template slot-scope="scope">
              <el-tag size="medium">{{ scope.row.userName | isSchoolFilter(2)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="学号" width="180">
            <template slot-scope="scope">
              <el-tag size="medium">{{ scope.row.userNum }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否住校" width="180">
            <template slot-scope="scope">
              {{scope.row.isScool}}
              <el-tag
                size="medium"
                :type="scope.row.isScool?'success':'warning'"
              >{{ scope.row.isScool | isSchoolFilter(1) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <hr />
        <div>
          <span
            style="font-size:30px;display:inline-block;background:#aaccaa;vertical-align:bottom;height:40px;"
          >模糊查询：</span>
          <el-input style="width:500px;" v-model="goodsInput" @blur="searchGoodsFn"></el-input>
        </div>
        <table border="1" width="500" align="center" cellspacing="0" cellpadding="6">
          <caption>gouwuche</caption>
          <thead>
            <tr align="center">
              <th>商品名称</th>
              <th>商品数量</th>
              <th>商品单价</th>
              <th>商品金额</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr align="center" v-for="(item,index) in goodsData" :key="index">
              <td>{{item.name}}</td>
              <td>
                <button @click="--item.count" :class="{'pointEvent':item.count==0}">-</button>
                {{item.count}}
                <button @click="++item.count">+</button>
              </td>
              <td>{{item.price|goodsPriceFilter}}</td>
              <td>{{item.count*item.price|goodsPriceFilter}}</td>
              <td>
                <button>删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div>{{goodsTotal}}件商品总计（不含运费）:{{goodsAllmoney|goodsPriceFilter}}</div>
        <el-button :loading="BtnLoading" @click="BtnLoadingFn">加载中</el-button>
        <hr />
      </el-tab-pane>
      <el-tab-pane label="CSS效果" name="second">CSS效果</el-tab-pane>
      <el-tab-pane label="eventBus" name="third">eventBus</el-tab-pane>
      <el-tab-pane label="elScroll" name="elScroll">el-滚动条</el-tab-pane>
    </el-tabs>

    <!-- <div class="throttle" @mousemove="throttleFn"></div> -->
    <div class="activeClass" :class="ActiveC?'red':'blue'" v-chang-dir="'v-chang-dir'">自定义指令</div>
  </div>
</template>
<script>
import {} from 'vuex';
import {} from 'vant';

export default {
  name: 'Self-select',
  data() {
    return {
      idR: 'cool',
      canshu: 123456,
      ActiveC: true,
      activeName: 'first',
      BtnLoading: false,
      goodsInput: '',
      isBtn: false,
      isNBtn: false,
      inputAllBox: false,
      checked: true,
      checkedPop: false,
      input: '',
      userName: '',
      userNum: '',
      isScool: true,
      SchooltableData: [],
      tags: [],
      tagsprimariy: [
        { name: '标签一', primariyType: false },
        { name: '标签二', primariyType: false },
        { name: '标签三', primariyType: false },
        { name: '标签四', primariyType: false },
        { name: '标签五', primariyType: false },
        { name: '标签六', primariyType: false },
        { name: '标签七', primariyType: false },
        { name: '标签八', primariyType: false },
        { name: '标签九', primariyType: false },
        { name: '标签十', primariyType: false },
        { name: '标签十一', primariyType: false },
        { name: '标签十二', primariyType: false },
      ],
      Lists: [
        {
          age: 1, sex: '女孩', hobbit: '唱跳', inputBox: false,
        },
        {
          age: 2, sex: '女孩', hobbit: 'rap', inputBox: false,
        },
        {
          age: 3, sex: '男孩', hobbit: '唱跳', inputBox: false,
        },
        {
          age: 4, sex: '女孩', hobbit: '唱跳', inputBox: false,
        },
        {
          age: 5, sex: '男孩', hobbit: '舞', inputBox: false,
        },
      ],
      privince: '北京',
      city: [],
      town: [],
      cityinfo: '',
      towninfo: '',
      list: [
        {
          name: '北京',
          sub: [
            { name: '请选择', sub: [] },
            {
              name: '北京',
              sub: [
                { name: '请选择' },
                { name: '东城区' },
                { name: '西城区' },
                { name: '崇文区' },
                { name: '宣统区' },
              ],
            },
          ],
        },
        {
          name: '广东',
          sub: [
            { name: '请选择', sub: [] },
            {
              name: '广州',
              sub: [
                { name: '请选择' },
                { name: '越秀区' },
                { name: '荔湾区' },
                { name: '海珠区' },
                { name: '天河区' },
              ],
            },
            {
              name: '深圳',
              sub: [
                { name: '请选择' },
                { name: '福田区' },
                { name: '南山区' },
                { name: '宝安区' },
                { name: '罗湖区' },
              ],
            },
            {
              name: '珠海',
              sub: [{ name: '请选择' }, { name: '香洲区' }, { name: '斗门区' }, { name: '金湾区' }],
            },
            {
              name: '汕头',
              sub: [
                { name: '请选择' },
                { name: '金平区' },
                { name: '濠江区' },
                { name: '龙湖区' },
                { name: '潮汕区' },
              ],
            },
          ],
        },
        {
          name: '上海',
          sub: [
            { name: '请选择', sub: [] },
            {
              name: '上海',
              sub: [
                { name: '请选择' },
                { name: '浦东区' },
                { name: '静文区' },
                { name: '虹口区' },
                { name: '嘉定区' },
              ],
            },
          ],
        },
        {
          name: '湖南',
          sub: [
            { name: '请选择', sub: [] },
            {
              name: '长沙',
              sub: [
                { name: '请选择' },
                { name: '开福区' },
                { name: '浏阳区' },
                { name: '宁乡区' },
                { name: '天心区' },
                { name: '芙蓉区' },
              ],
            },
            {
              name: '邵阳',
              sub: [
                { name: '请选择' },
                { name: '隆回县' },
                { name: '新宁县' },
                { name: '邵东县' },
                { name: '洞口县' },
                { name: '大祥县' },
              ],
            },
            {
              name: '岳阳',
              sub: [{ name: '请选择' }, { name: '华容县' }, { name: '平江县' }, { name: '汨罗县' }],
            },
            {
              name: '永州',
              sub: [
                { name: '请选择' },
                { name: '东安县' },
                { name: '宁远县' },
                { name: '蓝山县' },
                { name: '零崊县' },
              ],
            },
          ],
        },
      ],
      goodsData: [
        { name: '苹果1', count: 1, price: 23 },
        { name: '苹果2', count: 1, price: 2.3 },
        { name: '苹果3', count: 5, price: 5.9 },
        { name: '苹果4', count: 1, price: 12.9 },
        { name: '苹果5', count: 1, price: 23 },
        { name: '苹果6', count: 1, price: 69 },
        { name: '苹果7', count: 1, price: 16 },
        { name: '苹果8', count: 1, price: 3.5 },
      ],
    };
  },
  components: {},
  computed: {
    selectedTags() {
      return this.tagsprimariy.filter((item, index) => item.primariyType == true).length;
    },
    goodsTotal() {
      return this.goodsData.reduce((pre, next) => pre + next.count, 0);
    },
    goodsAllmoney() {
      return this.goodsData.reduce((pre, next) => pre + next.count * next.price, 0);
    },
  },
  filters: {
    isSchoolFilter(data, str) {
      // 文本格式化   管道思想  可以处理默认值的思想
      if (str == 1) {
        if (data) {
          return '住校';
        }
        return '不住校';
      }
      if (str == 2) {
        if (data) {
          return data;
        }
        return '没有填写姓名';
      }
    },
    goodsPriceFilter(data) {
      return `￥${data.toFixed(2)}`;
    },
  },
  created() {
    console.log('created');
  },
  beforeUpdate() {
    console.log('beforeUpdate');
  },
  updated() {
    console.log('Update');
  },
  mounted() {
    this.privinceFn();
    this.cityFn();
    console.log('mounted');
  },
  methods: {
    BtnFn() {
      this.isBtn = !this.isBtn;
      if (!this.isBtn) return;
    },
    itemInputFn(item) {
      /** 第一种方法
      var inBox =  this.Lists.filter((item,index)=>{ return item.inputBox == true
      }).length
     inBox==this.Lists.length?this.inputAllBox = true:this.inputAllBox = false
      */

      // 第二种方法
      this.inputAllBox = this.Lists.every((item, index) => item.inputBox);
    },
    checkBoxAllFn() {
      this.Lists.forEach((item, index) => {
        item.inputBox = this.inputAllBox;
      });
    },
    checkBoxFn() {
      this.checkedPop = !this.checkedPop;
    },
    tagsprimariyFn(item) {
      item.primariyType = !item.primariyType;

      //  /**
      //  *第一种方法(右边数据去重)
      if (item.primariyType) {
        this.tags.push(item);
        this.tags = [...new Set(this.tags)];
      } else {
        for (let i = 0; i < this.tags.length; i++) {
          if (item.name == this.tags[i].name) {
            this.tags.splice(i, 1);
          }
        }
      }

      //  */
      // 第二种方法(右边数据去重)

      // for (var i = 0; i < this.tags.length; i++) {
      //   console.log(item.name,"-==---=---",this.tags[i].name)
      //   if (item.name == this.tags[i].name)  { return };
      // }
      //  this.tags.push(item)


      // 第三种方法(右边数据去重)
      /**
      var isFlag = this.tags.filter((v,i)=>{
        return v.name==item.name
      })
      if(isFlag.length>0) return
        this.tags.push(item)
      */
    },
    tagsFn(item, index) {
      for (let i = 0; i < this.tagsprimariy.length; i++) {
        if (item.name == this.tagsprimariy[i].name) {
          this.tagsprimariy[i].primariyType = false;
        }
      }
      this.tags.splice(index, 1);
    },
    // 省市区
    privinceFn() {
      this.list.forEach((item, index) => {
        if (item.name == this.privince) {
          this.city = item.sub;
        }
      });
      this.cityinfo = this.city[1].name;
    },
    cityFn() {
      this.city.forEach((item, index) => {
        if (item.name == this.cityinfo) {
          this.town = item.sub;
        }
      });
      if (this.town.length > 0) {
        this.towninfo = this.town[1].name;
      } else {
        this.towninfo = '';
      }
    },
    addSchoolData() {
      this.SchooltableData.push({
        userName: this.userName,
        userNum: this.userNum,
        isScool: this.isScool,
      });
    },
    resetSchoolData() {
      this.userName = '';
      this.userNum = '';
      this.isScool = '';
    },
    handleEdit(i, r) {
      console.log(i, r);
    },
    handleDelete(i, r) {
      console.log(i, r);

      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.SchooltableData.splice(i, 1);
          this.$message({
            type: 'success',
            message: '删除成功!',
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          });
        });
    },
    searchGoodsFn() {
      const temporaryData = JSON.parse(JSON.stringify(this.goodsData));
      console.log(this.goodsInput, 'this.goodsInput2222222222');

      if (this.goodsInput) {
        const arr = this.goodsData.filter((item, index) => item.name.includes(this.goodsInput));
        console.log(this.goodsInput, 'this.goodsInput');
        console.log(arr, 'arr');
        this.goodsData = arr;
      } else {
        // debugger
        this.goodsData = [...temporaryData];
        // const temporaryData = [...this.goodsData]
      }
    },
    BtnLoadingFn() {
      const that = this;
      that.BtnLoading = true;
      // console.log('加载中');

      setTimeout(async () => {
        that.BtnLoading = await false;
      }, 5000);
    },
    DoFn() {
      // console.log('节流了');
    },
    throttleFn(DoFn) {
      // console.log(DoFn, '?????');
    },
    handleClick(tab, event) {
      // console.log(tab, event);
      if (tab.label == 'CSS效果') {
        this.$router.push({ path: `/config/${this.idR}` });
      } else if (tab.label == 'eventBus') {
        this.$router.push({ path: `/bus` });
      } else if (tab.label == 'elScroll') {
        this.$router.push({ path: `/elScroll` });
      }
    },
  },
  directives: {
    changDir: {
      bind(el, bind) {
        console.log(el,bind)
      },
    },
  },
};
</script>

<style scoped lang="scss">
.left-part {
  height: 300px;
  h1 {
    text-align: center;
  }
  .left-pane {
    padding: 50px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: flex-start;
    span {
      margin: 0 10px 10px 10px;
    }
  }
}

.right-part {
  height: 300px;

  h1 {
    text-align: center;
  }
}
.right-pane {
  padding: 50px;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: flex-start;
  span {
    margin: 0 10px 10px 10px;
  }
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.slideAn-enter-active {
  transition: all 0.3s ease;
}
.slide-enter, .slide-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
}
.divClass {
  width: 200px;
  height: 100px;
  background: pink;
}
.cursor {
  cursor: no-drop;
}
.pointEvent {
  pointer-events: none;
}
.throttle {
  width: 300px;
  height: 300px;
  background: #aca;
}
.activeClass{
  width: 300px;
  height: 300px;

}
.red{
  background: red;

}
.blue{
  background: blue;
}
</style>
