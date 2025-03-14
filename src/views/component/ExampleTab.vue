<template>
  <v-row no-gutters>
    <v-col
      cols="11"
    >
      <vue-tabs-chrome
        ref="tab"
        v-model="tab"
        theme="custom"
        :tabs="tabs"
        class="text-overline"
        @remove="remove"
        @click="click"
      />
    </v-col>
    <v-col
      cols="1"
    >
      <v-btn
        text
        block
        @click="clearTabs"
      >
        Limpar
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    data () {
      return {
        tab: '',
        tabs: [],
      }
    },

    computed: {
      ...mapGetters(['tabContents', 'tabIndex', 'tabOpens']),
    },

    mounted () {
      const addFromTabContent = (item) => {
        this.addTab(
          item.id,
          item.name,
          item.routerName,
          item.label,
          item.path,
          item.props,
          item.unique,
        )
      }

      this.tabContents.forEach(item => {
        addFromTabContent(item)
      })

      const length = this.tabs.length
      if (length > 0) {
        this.tab = this.tabs[length - 1].id
      }

      this.$store.subscribe((mutation, state) => {
        switch (mutation.type) {
          case 'NEW_TAB_ITEM':
            addFromTabContent(mutation.payload)
            break
          case 'CHANGE_TAB':
            this.tab = mutation.payload
            break
        }
      })
    },

    methods: {
      addTab (id, routerName, name, label, path, props, unique) {
        if (this.$refs.tab && routerName !== 'menu') {
          const key = id
          this.$refs.tab.addTab({ key, id, name, routerName, label, path, props, unique })
          this.tab = id
        }
      },

      remove ({ key }) {
        this.$store.dispatch('closeTab', key)
        const tab = this.tabs.find(it => it.id === this.tab)
        if (tab && this.$route.path !== tab.path) {
          const props = this.tabContents.find(it => it?.id === tab.id).props
          this.$router.push({ name: tab.name, params: { ...props } })
        }

        if (this.tabOpens === 0) {
          this.$router.push('/dashboard/menu')
        }
      },

      clearTabs () {
        this.tabContents.forEach(item => {
          if (this.tab !== item.id) {
            this.remove({ key: item.id })
            this.$refs.tab.removeTab(item.id)
          }
        })
      },

      click (event, tab, index) {
        if (tab.path && this.$route.path !== tab.path) {
          // const name = tab.unique ? tab.name : `${tab.name}__${tab.props.cd}`
          let props = null
          if (tab.id) {
            props = this.tabContents.find(it => it?.id === tab.id).props
          }
          this.$router.push({ name: tab.name, params: props })
        }
      },
    },
  }
</script>

<style>
  .vue-tabs-chrome.theme-custom {
    padding-top: 0;
    background-color: transparent;
    overflow: hidden;
  }
  .vue-tabs-chrome.theme-custom .tabs-content {
    height: 48px;
    color: black;
  }
  .vue-tabs-chrome.theme-custom .tabs-background-content {
    background-color: rgba(255,255,255,0.5);
    margin-left: 5px;
    border-radius: 0px 0px 0px 0px;
  }
  .vue-tabs-chrome.theme-custom .active {
    color: black;
  }
  .vue-tabs-chrome.theme-custom .tabs-footer,
  .vue-tabs-chrome.theme-custom .tabs-divider,
  .vue-tabs-chrome.theme-custom .tabs-background-before,
  .vue-tabs-chrome.theme-custom .tabs-background-after {
    display: none;
  }
</style>
