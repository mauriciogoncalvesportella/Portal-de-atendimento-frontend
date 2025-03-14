<template>
  <v-card
    tile
    class="my-1"
  >
    <v-list
      class="pa-0"
    >
      <v-subheader
        class="text-h4 d-flex align-center"
      >
        {{ source.idfantasia }}
        <v-icon
          class="ml-2"
          size="22px"
          @click="source.createFone(source)"
        >
          mdi-phone-plus
        </v-icon>
      </v-subheader>
      <v-hover
        v-for="(chaveFone, index) in source.chaveFones"
        :key="chaveFone.cd"
      >
        <template
          #default="{ hover }"
        >
          <v-list-item
            dense
            :style="`background: ${hover ? '#ECEFF1' : 'white'}`"
          >
            <v-list-item-content>
              <div
                class="d-flex"
              >
                <v-chip
                  v-if="chaveFone.idnome"
                  small
                  label
                  class="mr-1"
                >
                  <v-icon
                    left
                  >
                    mdi-account
                  </v-icon>
                  {{ chaveFone.idnome }}
                </v-chip>
                <v-chip
                  small
                  label
                >
                  <v-icon
                    left
                  >
                    mdi-phone
                  </v-icon>
                  {{ chaveFone.fone | telefone }}
                </v-chip>
              </div>
            </v-list-item-content>
            <v-list-item-icon
              class="d-flex align-center"
            >
              <v-progress-circular
                v-if="source.foneLoading && source.foneLoading.fone == chaveFone.fone"
                indeterminate
                color="primary"
                width="3"
                size="20"
              />
              <template
                v-else
              >
                <v-hover
                  v-slot="{ hover }"
                >
                  <v-icon
                    :color="hover ? 'primary' : 'grey'"
                    style="cursor: pointer"
                    @click="source.editFone(source, index)"
                  >
                    mdi-pencil
                  </v-icon>
                </v-hover>
                <v-hover
                  v-slot="{ hover }"
                >
                  <v-icon
                    :color="hover ? 'red' : 'grey'"
                    style="cursor: pointer"
                    @click="source.deleteFone(source, index)"
                  >
                    mdi-delete
                  </v-icon>
                </v-hover>
              </template>
            </v-list-item-icon>
          </v-list-item>
        </template>
      </v-hover>
    </v-list>
  </v-card>
</template>

<script>
  export default {
    props: {
      source: {
        type: Object,
        default: () => {},
      },
    },
  }
</script>
