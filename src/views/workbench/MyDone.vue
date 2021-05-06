<template>
  <work-item-card :type="workbenchCardTypes['done']"></work-item-card>
</template>

<script>
/**
 * @title 我完成的
 * @author chenxiaolong
 * @date 2021.01.07
 */

import WorkItemCard from './WorkItemCard'
import { workbenchCardTypes } from './constant'

export default {
  name: 'MyDone',
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
