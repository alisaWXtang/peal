<template>
  <el-scrollbar class="entry-scroll" style="height:100%;">
    <div class="entry-page">
      <div class="wrapper">
        <div class="header">
          <div class="fx-jcsbaic page-header wrapper-center">
            <img src="@/assets/images/logo.svg" alt />
            <div>
              <span class="okrurl">https://okr.myoas.com</span>
              <router-link to="/home" tag="span" class="enterBtn">进入系统</router-link>
            </div>
          </div>
        </div>

        <div class="wrapper-center">
          <div class="content-header fx-jcsb">
            <div class="content-header-left">
              <h2>OKR系统</h2>
              <h2>让目标制定和落地更简单</h2>
              <p>OKR (Objectives and Key Results)即目标与关键成果法,是一套明确和跟踪目标及其完成情况的管理工具和方法，OKR可以有效确保员工密切协作，把精力聚焦在能促进组织成长的、可衡量的贡献上。</p>
            </div>
            <div><img src="@/assets/images/illustration1.png" style="width:526px;height:237px" /></div>
          </div>
          <h2 class="tiltleCenter">OKR主要阶段及功能匹配</h2>
          <p
            class="tltieCenter-des"
          >要落地OKR，需要一个合适的平台，OKR系统是OKR管理方法以软件形式实施落地的企业协作平台，互联网质量运营团队对OKR进行了深入研究，所以产品设计中的每个功能和细节，都契合了OKR的功能需求。</p>
          <div class="fouritems fx-wrapC">
            <div v-for="(item,index) in fourIcList" :key="index" class="fx-jcc fourIclass" :class="item.class">
              <div class="itemcenter">
                <div class="fouritemsList fx-jcsb">
                  <div>
                    <h2>{{ item.title }}</h2>
                    <p>{{ item.p1 }}</p>
                    <p>{{ item.p2 }}</p>
                  </div>
                  <div>
                    <img :src="item.src" :style="item.style" />
                  </div>
                </div>
                <div class="functionly">功能匹配</div>
                <span class="options"></span>
                <span v-for="(v,i) in item.spans" :key="i" class="spanMagin">{{ v }}</span>
              </div>
            </div>
          </div>
          <h2 class="tiltleCenterNO2 fx-jcc">
            <img src="@/assets/images/angleOne.png" alt class="alignTop" />
            <span class="alignCenter">OKR系统产品特性展示</span>
            <img src="@/assets/images/angleTwo.png" alt class="alignBottom" />
          </h2>
        </div>
        <ul class="ulList">
          <li v-for="(item,index) in ulList" :key="index">
            <div
              v-show="(index+1)%2===1&&item.type==='nomal'"
              class="wrapper-center fx-jcsb heightover"
            >
              <div class="ulList-left">
                <h2>{{ item.title }}</h2>
                <p v-for="(v,i) in item.ps" :key="i">{{ v }}</p>
              </div>
              <div class="fe-self-align">
                <img :src="item.src" alt :style="item.style" />
              </div>
            </div>
            <div
              v-show="(index+1)%2===0&&item.type==='nomal'"
              class="wrapper-center fx-jcsb heightover"
            >
              <div class="fe-self-align">
                <img :src="item.src" alt :style="item.style" />
              </div>
              <div class="ulList-left">
                <h2>{{ item.title }}</h2>
                <p v-for="(v,i) in item.ps" :key="i">{{ v }}</p>
              </div>
            </div>
            <div v-show="item.type==='list'" class="wrapper-center fx-jcsbaic heightover heighter">
              <div v-for="(v,i) in item.fouritemList" :key="i" class="rowcenter fx-dcolm">
                <div><img :src="v.src" alt :style="item.style" /></div>
                <h2>{{ v.h2 }}</h2>
                <p>{{ v.p }}</p>
              </div>
            </div>
          </li>
        <!-- <li>
            <div class="jobs wrapper-center fx-jcsb heightover">
              <div class="fe-self-align">
                <img src="@/assets/images/illustration9.png" alt />
              </div>
              <div class="jobs-right">
                <h2>决定不做什么与决定做什么一样重要</h2>
                <p>—史帝夫 乔布斯</p>
              </div>
            </div>
          </li> -->
        </ul>
        <div class="footer fx-dcolmC">
          <div class="footer-top fx-jccaic">
            <span></span>
            <span>互联网质量运营部宣</span>
            <span></span>
          </div>
          <div class="footer-bottom">OKR系统 让目标制定和落地更简单</div>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
export default {
  name: 'EntryPage',
  data() {
    return {
      fourIcList: [
        {
          title: '制定目标和关键结果',
          p1: '设定层级清晰并且具备关联性的目标',
          p2: '设定明确的，可量化的关键结果',
          src: require('@/assets/images/itemOne.png'),
          spans: ['OKR主页', '目标关键树', '草稿箱', '我的上级', '我的关注'],
          class: 'bgImg1',
          style: { width: '181px', height: '109px' },
        },
        {
          title: '公示阶段',
          p1: '目标以及关键结果公开透明，全员可见',
          p2: '成员参与讨论与修改OKR',
          src: require('@/assets/images/itemTwo.png'),
          spans: ['保密设置', '进展回顾-目标对齐', '报表管理'],
          class: 'bgImg2',
          style: { width: '145px', height: '109px' },

        },
        {
          title: '执行和评估',
          p1: '随时更新目标进度   沟通与协作',
          p2: '评估成员参与度   评估目标进度',
          src: require('@/assets/images/itemThree.png'),
          spans: ['我的进展', '进展回顾-日常Review'],
          class: 'bgImg3',
          style: { width: '165px', height: '117px' },

        },
        {
          title: '评分和复盘',
          p1: '评分',
          p2: '复盘',
          src: require('@/assets/images/itemFour.png'),
          spans: ['我的进展', '进展回顾-季度复盘', '报表管理'],
          class: 'bgImg4',
          style: { width: '157px', height: '110px' },

        },
      ],
      ulList: [
        {
          type: 'nomal',
          title: '制定目标及关键结果（OKR）',
          ps: [
            '以季度为周期，根据公司经营目标制定OKR。原则上目标的制定由高到低，从公司级到部门级再到个人级逐级关联，保证目标一致性。目标制定后，需要同步给全员，确保OKR公开透明。',
          ],
          src: require('@/assets/images/illustration2.png'),
          style: { width: '372px', height: '289px' },

        },
        {
          type: 'nomal',
          title: '设置对齐目标',
          ps: [
            '对齐是OKR方法论最重要特征之一。',
            '员工可以与其团队的共同目标保持一致。他们还可以贡献自己的OKR，以进一步推动公司的愿景。一致性带来了透明度，进而提高了责任感和员工之间的共同目标感。团结一致的员工与公司的愿景息息相关，并且能够看到他们的工作如何为公司的成功做出贡献',
          ],
          src: require('@/assets/images/illustration3.png'),
          style: { width: '404px', height: '258px' },

        },
        {
          type: 'nomal',
          title: '目标关系树',
          ps: [
            '目标关系树将目标间的对齐关系呈现出来，更加清晰直观，易于理解。以便员工时常审视目标的一致性。',
          ],
          src: require('@/assets/images/illustration4.png'),
          style: { width: '520px', height: '224px' },

        },
        {
          type: 'nomal',
          title: '我的进展',
          ps: [
            '一个好的计划如果没有实践，也不过是个美好的愿望。”—现代管理学之父：彼得 · 德鲁克',
            '我的进展，协助员工进行目标及关键成果的进度管理，提供完成率、进展描述、自评及历史进展等功能。',
          ],
          src: require('@/assets/images/illustration5.png'),
          style: { width: '466px', height: '308px' },

        },
        {
          type: 'nomal',
          title: '进展回顾',
          ps: [
            'OKR制定时，各团队可组织目标对齐会议，深入探讨目标的合理性及其对齐关系，并将经验沉淀下来。',
            'OKR 执行过程中，公司及各团队都需要根据任务完成情况，定期更新关键结果、评估目标完成情况。',
            '周期结束时，可对本周期的OKR执行情况进行打分，并讨论和回顾本周期OKR的执行情况。',
          ],
          src: require('@/assets/images/illustration6.png'),
          style: { width: '342px', height: '314px' },

        },
        {
          type: 'nomal',
          title: '报表管理',
          ps: [
            '管理者工具，通过数据图表更清晰地了解团队OKR制定情况及自评的完成情况。',
          ],
          src: require('@/assets/images/illustration7.png'),
          style: { width: '430px', height: '249px' },

        },
        {
          type: 'nomal',
          title: '保密设置',
          ps: [
            '可以创建组织保密，使得OKR仅组织内可见。但我们依然提倡透明，在公司范围内具有可见性的目标可以提高透明度，促进一致性并促进组织内的跨职能合作。',
          ],
          src: require('@/assets/images/illustration8.png'),
          style: { width: '437px', height: '256px' },

        },
        {
          type: 'list',
          fouritemList: [
            {
              src: require('@/assets/images/draft.svg'),
              h2: '草稿箱',
              p: '草稿箱支持员工反复推敲OKR直到满意为止，草稿箱内容仅自己可见。',
            },
            {
              src: require('@/assets/images/attention.svg'),
              h2: '我的上下级和关注',
              p:
                '我的上下级，紧跟上级的步伐，带领成员共同完成团队目标。与兄弟团队的某成员有紧密的合作，加入我的关注，保持密切沟通。',
            },
            {
              src: require('@/assets/images/way.svg'),
              h2: '新手指南',
              p:
                '在组织内采用OKR从未如此简单，OKR系统的直观界面，详尽的使用说明及演示视频，使员工只需10分钟即可入门。',
            },
            {
              src: require('@/assets/images/idea.svg'),
              h2: '意见反馈',
              p:
                'OKR系统使用过程中，有任何意见或建议请点击系统右下角”意见反馈“联络OKR工作人员。',
            },
          ],
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.entry-scroll {
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
.entry-page {
  width: 100%;
  .wrapper {
    width: 100%;
    background: #fff;
  }
  .wrapper-center {
    margin: 0 auto;
    width: 1200px;
  }
  .fx-jcsbaic {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .fx-jccaic {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .fx-jcc {
    display: flex;
    justify-content: center;
  }
  .fx-jcsb {
    display: flex;
    justify-content: space-between;
  }
  .fx-wrapC {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-content: center;
  }
  .fx-jcc {
    display: flex;
    justify-content: center;
  }
  .fx-dcolm {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .fx-dcolmC {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .page-header {
    height: 100px;

  }
  .page-header .okrurl {
    font-size: 24px;
    color: #272727;
    font-family: PingFangSC-Semibold;
    margin-right: 50px;
    display: inline-block;
  }
  .content-header {
    padding-top: 150px;
  }
  .content-header-left {
    width: 601px;
  }
  .content-header-left h2 {
    font-family: PingFangSC-Semibold;
    font-size: 40px;
    color: #272727;
    letter-spacing: 0;
    line-height: 68px;
  }
  .content-header-left p {
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #272727;
    letter-spacing: 0;
    line-height: 30px;
    padding-top: 37px;
  }
  .tiltleCenter {
    text-align: center;
    font-family: PingFangSC-Medium;
    font-size: 30px;
    color: #272727;
    padding-top: 166px;
  }
  .tiltleCenterNO2 {
    font-family: PingFangSC-Medium;
    font-size: 30px;
    color: #272727;
    height: 80px;
    margin: 35px 0px;
  }
  .tltieCenter-des {
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #272727;
    letter-spacing: 0;
    text-align: center;
    line-height: 24px;
    width: 900px;
    padding-top: 20px;
    margin: 0 auto;
  }
  .fouritems {
    margin-top: 60px;
    height: 640px;
    align-content: space-between;
  }
  // .fouritems > div {
  //   width: 560px;
  //   height: 341px;
  // }
  .options {
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: #1aa696;
    margin-right: 10px;
  }
  .functionly {
    font-family: PingFangSC-Medium;
    font-size: 20px;
    color: #272727;
    letter-spacing: 0;
    padding-top: 46px;
    padding-bottom: 8px;
  }
  .fouritemsList > div > h2 {
    font-family: PingFangSC-Semibold;
    font-size: 20px;
    color: #1aa696;
    letter-spacing: 0;
    padding-bottom: 26px;
  }
  .fouritemsList > div > p {
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #272727;
    line-height: 22px;
  }
  .fouritemsList > div :nth-child(3) {
    margin-top: 8px;
  }
  .itemcenter {
    box-sizing: content-box;
    width: 100%;
    border-radius: 4px;
    border-radius: 4px;
  }
  .fourIclass{
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    width: 560px;
    padding: 20px 27px 0px;
    height: 280px;
    box-sizing: border-box;
  }
  .ulList {
    width: 100%;
  }
  .ulList li:nth-child(even) {
    background: #fff;
    min-height: 400px;
  }
  .ulList li:nth-child(odd) {
    background: #f8f8f8;
    min-height: 400px;
  }
  .ulList li > div {
    min-height: 400px;
  }
  .ulList-left {
    width: 505px;
  }
  .ulList .ulList-left > h2 {
    padding-top: 100px;
    font-family: PingFangSC-Medium;
    font-size: 30px;
    color: #272727;
  }
  .ulList .ulList-left > p {
    padding-top: 17px;
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #272727;
    letter-spacing: 0;
    line-height: 30px;
  }
  .ulList .ulList-left p + p {
    padding-top: 0px;
  }
  .fe-self-align {
    align-self: center;
  }
  .heightover {
    height: 100%;
  }
  .heighter {
    padding: 45px 0;
  }
  .rowcenter {
    width: 270px;
    height: 360px;
    box-sizing: border-box;
    padding: 20px;
    background: #ffffff;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    border-radius: 4px;
  }
  .spanMagin {
    margin-right: 10px;
  }
  .rowcenter h2 {
    padding: 7px 0px 20px 0px;
    font-size: 20px;
    color: #272727;
    font-family: PingFangSC-Regular;
  }
  .rowcenter p {
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #272727;
    letter-spacing: 0;
    line-height: 24px;
  }
  .jobs-right h2 {
    margin-top: 176px;
    font-family: PingFangSC-Medium;
    font-size: 44px;
    color: #272727;
    letter-spacing: 0;
    line-height: 62px;
  }
  .jobs-right p {
    margin-top: 20px;
    font-family: PingFangSC-Regular;
    font-size: 36px;
    color: #272727;
    letter-spacing: 0;
    line-height: 50px;
  }
  .footer {
    height: 150px;
    background: #1aa696;
  }
  .footer-top span {
    display: inline-block;
  }
  .footer-top span:nth-child(1) {
    width: 90px;
    height: 4px;
    background: #ffcb1b;
  }
  .footer-top span:nth-child(3) {
    width: 90px;
    height: 4px;
    background: #ffcb1b;
  }
  .footer-top span:nth-child(2) {
    color: #ffffff;
    font-family: PingFangSC-Regular;
    font-size: 26px;
    margin: 0 20px;
    line-height: 52px;
  }
  .footer-bottom {
    color: #ffffff;
    font-family: PingFangSC-Regular;
    font-size: 26px;
    line-height: 52px;
  }
  .alignTop {
    align-self: flex-start;
  }

  .alignBottom {
    align-self: flex-end;
  }
  .alignCenter {
    align-self: center;
  }
//   .bgImg1 {
//     background-image: url("@/assets/images/numOne.png");
//     background-repeat: no-repeat;
//     background-position: 30px 22px;
//   }
//   .bgImg2 {
//     background-image: url("@/assets/images/numTwo.png");
//     background-repeat: no-repeat;
//     background-position: 30px 22px;
//   }
//   .bgImg3 {
//     background-image: url("@/assets/images/numThree.png");
//     background-repeat: no-repeat;
//     background-position: 30px 22px;
//   }
//   .bgImg4 {
//     // background-image: url("@/assets/images/numFour.png");
//     // background-repeat: no-repeat;
//     // background-position: 30px 22px;
//   }
  .header{
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: #fff;
  }
  .enterBtn {
    width: 100px;
    height: 40px;
    background: #00A996;
    line-height: 40px;
    display: inline-block;
    border-radius: 40px;
    text-align: center;
    font-size: 16px;
    color: #fff;
    cursor: pointer;
    transition: all .2s;
    &:hover{
      background: #1ec0ad;
    }
  }
}

h2{
  margin: 0px;
}
</style>
