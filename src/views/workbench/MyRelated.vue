<template>
  <work-item-card :type="workbenchCardTypes['related']"></work-item-card>
</template>

<script>
/**
 * @title 我相关的
 * @author chenxiaolong
 * @date 2021.01.07
 */

import WorkItemCard from './WorkItemCard'
import { workbenchCardTypes } from './constant'

export default {
  name: 'MyRelated',
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
