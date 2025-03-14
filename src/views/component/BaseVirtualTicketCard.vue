<template>
  <ticket-card
    :ticket="source"
    class="ma-2"
    @click="$emit('open-ticket', source.ticket)"
  />
</template>

<script>
  import TicketCard from '@/views/component/BaseTicketCard'
  export default {
    components: {
      TicketCard,
    },
    props: {
      index: { // index of current item
        type: Number,
        default: -1,
      },
      source: { // here is: {uid: 'unique_1', text: 'abc'}
        type: Object,
        default () {
          return {
          }
        },
      },
    },
  }
</script>
