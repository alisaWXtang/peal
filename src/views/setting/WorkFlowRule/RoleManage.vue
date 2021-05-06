<template>
  <div class="p-t-20">
    <div>
      <span class="f-w-700">{{ $t('只有以下角色能将状态置为目标状态') }}</span
      ><span>（{{ $t('如果为空则默认所有人有权限') }}。）</span>
    </div>
    <el-form
      ref="form"
      :label-width="$isEnglish() ? '120px' : '80px'"
      class="role-form"
    >
      <el-form-item :label="$t('成员角色')" class="role-form-item">
        <el-checkbox-group v-model="checkedRole" class="m-l-40">
          <el-checkbox
            v-for="role in roleList"
            :key="role.groupId"
            class="checkbox-label-item"
            :label="role.groupId"
            :title="role.groupName"
            >{{ role.groupName }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item :label="$t('人员字段')" class="role-form-item">
        <el-checkbox-group v-model="checkedPerson" class="m-l-40">
          <el-checkbox
            v-for="person in personList"
            :key="person.attrName"
            class="checkbox-label-item"
            :label="person.attrName"
            :title="person.fieldName"
            >{{ person.fieldName }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
/**
 * @title 只有以下角色能将状态置为目标状态
 * @desc
 * @author huangmei
 * @date
 */
export default {
  name: 'RoleManage',
  components: {},
  mixins: [],
  props: {
    checkedRoleList: Array,
    checkedPersonList: Array,
    roleList: Array,
    personList: Array,
  },

  data() {
    return {
      checkedRole: this.checkedRoleList,
      checkedPerson: this.checkedPersonList,
    }
  },
  watch: {
    checkedRole(val) {
      this.$emit('update:checkedRoleList', val)
    },
    checkedPerson(val) {
      this.$emit('update:checkedPersonList', val)
    },
  },
}
</script>
<style lang="scss" scoped>
.p-t-20 {
  padding-top: 20px;
}
.f-w-700 {
  font-weight: 700;
}
.role-form {
  margin: 20px auto;
  border: 1px solid #dde5ef;
  .role-form-item {
    &:first-child {
      border-bottom: 1px solid #dde5ef;
    }
    margin-bottom: 0;
  }
  .m-l-40 {
    margin-left: 40px;
  }
  .checkbox-label-item {
    margin-left: 0;
    width: 140px;
    /deep/ {
      .el-checkbox__label {
        width: 100px;
        line-height: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
