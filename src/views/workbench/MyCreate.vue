<template>
  <work-item-card :type="workbenchCardTypes['create']"></work-item-card>
</template>

<script>
/**
 * @title 我创建的
 * @author chenxiaolong
 * @date 2021.01.07
 */

import WorkItemCard from './WorkItemCard'
import { workbenchCardTypes } from './constant'

export default {
  name: 'MyCreate',
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
