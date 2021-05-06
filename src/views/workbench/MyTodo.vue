<template>
  <work-item-card :type="workbenchCardTypes['todo']"></work-item-card>
</template>

<script>
/**
 * @title 我的待办
 * @author chenxiaolong
 * @date 2021.01.07
 */

import WorkItemCard from './WorkItemCard'
import { workbenchCardTypes } from './constant'

export default {
  name: 'MyTodo',
  components: {
    WorkItemCard,
  },
  data() {
    return {
      workbenchCardTypes,
    }
  },
}
</script>
