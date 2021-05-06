<template>
  <el-card class="base-card-container" v-bind="$attrs">
    <div slot="header" class="base-card-container__header">
      <slot name="header"></slot>
    </div>
    <div class="base-card-container__content">
      <slot name="content"></slot>
    </div>
    <div v-if="showFooter" class="base-card-container__footer">
      <slot name="footer"></slot>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    showFooter: {
      type: Boolean,
      default: true,
      desc: '是否显示footer',
    },
  },
}
</script>

<style lang="scss">
.coteam-workbench-tooltip {
  &.el-tooltip__popper {
    border-radius: 4px;
  }
}
</style>

<style lang="scss" scoped>
.base-card-container {
  position: relative;
  padding: 24px 24px 14px 24px;
  box-sizing: border-box;
  border: none;

  /deep/ *,
  /deep/ *::after,
  /deep/ *::before {
    box-sizing: border-box;
  }

  /deep/ * ::-webkit-scrollbar {
    width: 5px !important;
    height: 5px !important;
  }

  &.is-never-shadow {
    border: none;
  }
  &.empty-card {
    /deep/ .el-card__body {
      height: calc(100% - 46px);
      .base-card-container__content {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  /deep/ .empty-data {
    padding: 20px;
    img {
      width: 200px;
      display: block;
      margin: auto;
      filter: grayscale(1);
      opacity: 0.4;
    }
    .desc {
      text-align: center;
      font-size: 12px;
      color: #999999;
    }
  }

  /deep/ .el-card__header {
    padding: 0;
    margin-bottom: 16px;
    border: none;

    .header-title {
      font-family: PingFangSC-Medium;
      font-size: 16px;
      color: $--color-text-fine;
      font-weight: 600;
    }
  }

  /deep/ .el-card__body {
    padding: 0 !important;
  }

  .base-card-container__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 26px;

    /deep/ .header-right {
      display: flex;
      align-items: center;

      .operation-icon {
        font-size: 16px;
        cursor: pointer;
        color: $--color-text-secondary;

        &:not(:first-child) {
          margin-left: 16px;
        }

        &:hover {
          color: $--color-primary;
        }
      }
    }

    /deep/ .can-edit-name {
      cursor: pointer;
      > i {
        display: none;
      }

      &:hover {
        > i {
          display: inline-block;
        }
        color: $--color-primary;
      }
    }

    /deep/ .edit-card-name {
      .el-input__inner {
        border: none;
        border-bottom: 1px solid #dde5ef;
        border-radius: 0;
        padding-right: 50px;
        height: 26px;

        &:focus {
          border-bottom: 2px solid #999999;
        }
      }

      .el-input__count-inner {
        color: $--color-primary;
      }
    }
  }

  .base-card-container__content {
    /deep/ .data-table,
    /deep/ .el-table {
      .el-table__empty-img {
        > span {
          display: none;
        }
        display: block;
        width: 400px;
        height: 250px;
        background-image: url('~@/assets/workbench/empty.png');
        background-position: top;
        filter: grayscale(1);
        opacity: 0.4;
      }

      td {
        padding: 7px 0;
      }
      th {
        padding: 4px 0;
      }

      th[class*='el-table']:not(:first-child) {
        border-left: 2px solid #fff;
      }

      th .cell {
        display: flex;
        align-items: center;
      }

      .el-table__header thead > tr:first-child {
        height: 44px;
      }

      tbody tr {
        height: 40px;
      }

      .el-table__body tr > td {
        padding: 6px 0 5px 0;
      }

      tr {
        th:first-child,
        td:first-child {
          padding-left: 24px;
        }

        th:last-child,
        td:last-child {
          padding-right: 24px;
        }
      }
      .table-id {
        cursor: pointer;
        &:hover {
          color: $--color-primary;
        }
      }
      .table-title {
        display: flex;
        align-items: center;

        > i {
          margin-right: 5px;
          flex: 0 0 auto;
        }

        .table-input-edit-icon {
          left: 0;
          margin-left: 5px;
        }

        .title-text {
          max-width: 100%;
          flex: 0 1 auto;
          display: inherit;
          height: 24px;
          @include no-wrap;
        }

        .icon-xuqiu,
        .icon-renwu,
        .icon-quexian {
          color: $--color-icon-default;
          margin-right: 6px;
        }

        &:hover {
          .title-text {
            color: $--color-primary;
          }
          .icon-xuqiu {
            color: $--color-icon-xuqiu;
          }
          .icon-renwu {
            color: $--color-icon-renwu;
          }
          .icon-quexian {
            color: $--color-icon-quexian;
          }
        }

        .delay-text {
          flex: 0 0 auto;
          margin-left: 8px;
          display: flex;
          align-items: center;

          > i {
            margin-right: 2px;
          }

          &.danger {
            color: $--color-danger;
          }

          &.warning {
            color: $--color-warning;
          }
        }
      }

      .work-item-level,
      .statusbox-list-common {
        cursor: pointer;
        color: var(--color);
        border: 1px solid var(--color);
        border-radius: 4px;
        display: inline-block;
        padding: 0;
        font-size: 12px;
        text-align: center;
        width: 40px;
        height: 24px;
        &:hover {
          color: #fff;
          background-color: var(--color);
        }
      }

      .statusbox-list-common {
        line-height: 24px;
      }

      .pop-trigger {
        padding: 0 5px;
        color: var(--color);
        background-color: #fff;
        width: 64px;
        height: 24px;
        font-size: 12px;

        &:hover {
          color: #fff;
          background-color: var(--color);
        }

        .witem-btn__container {
          line-height: normal;
          i {
            display: none;
          }

          .title {
            min-width: 100%;
          }
        }
      }
    }
  }

  .base-card-container__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  /deep/ .work-items-type__content {
    border-bottom: $borderSolid;
    margin-bottom: 20px;
    .el-radio-group {
      .el-radio-button__inner {
        padding: 0 5px 17px 5px;
        border: 1px solid $--color-white;
        font-size: 14px;
        border-radius: unset;

        &:hover {
          background-color: #fff;
        }
      }
      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        color: $--color-primary;
        background-color: $--color-white;
        border: 1px solid $--color-white;
        border-bottom: 1px solid $--color-primary;
      }

      .el-radio-button:not(:first-child) {
        margin-left: 24px;
      }
    }
  }

  /deep/ .delay-text {
    margin-left: 8px;
    > i {
      margin-right: 2px;
    }

    &.danger {
      color: $--color-danger !important;
    }

    &.warning {
      color: $--color-warning !important;
    }
  }
  /deep/ .work-items-pagination__content {
    padding-top: 14px;
    padding-bottom: 28px;
    .work-items-pagination__content {
      margin-bottom: -4px;
      margin-left: 20px;
      margin-right: 8px;
    }
  }
}

/deep/ .el-table__body td {
  border-color: $--color-divider !important;
}
/deep/ .el-table--border th {
  border-right: 1px solid #f2f6fc !important;
}
/deep/ .el-table--border {
  border-width: 0;
}
/deep/ .el-table__body td {
  border-width: 0;
}
</style>
