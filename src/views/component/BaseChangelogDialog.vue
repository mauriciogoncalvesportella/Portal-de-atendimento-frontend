<template>
  <v-dialog
    v-model="dialog"
    :max-width="1200"
  >
    <template
      v-slot:activator="{ on }"
    >
      <v-list-item
        link
        v-on="on"
      >
        <v-list-item-icon>
          <v-icon>
            mdi-notebook-edit
          </v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title
            class="text-overline"
          >
            Histórico
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card>
      <v-timeline
        dense
      >
        <v-timeline-item
          v-for="item in changeLog"
          :key="`timeline-item-${item.date}`"
        >
          <v-container>
            {{ item.date }}
            <v-divider />
            Inovações/Alterações
            <ul>
              <li
                v-for="(inovation, i) in item.inovations"
                :key="`li-${i}`"
              >
                {{ inovation }}
              </li>
            </ul>
            <br>
            Correções
            <ul>
              <li
                v-for="(bugfix, i) in item.bugfix"
                :key="`li-${i}`"
              >
                {{ bugfix.error }}
                <ul
                  v-if="bugfix.solution"
                >
                  <li>
                    {{ bugfix.solution }}
                  </li>
                </ul>
              </li>
            </ul>
          </v-container>
        </v-timeline-item>
      </v-timeline>
    </v-card>
  </v-dialog>
</template>

<script>
  import changeLog from '@/CHANGELOG'
  export default {
    name: 'DialogChangelog',
    data () {
      return {
        dialog: false,
        changeLog: changeLog,
      }
    },
    methods: {
    },
  }
</script>
