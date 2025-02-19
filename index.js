/// <reference path="typedefs.d.ts" />
const siteData = Vue.reactive({})
const html = String.raw

const app = Vue.createApp({
  template: html` <div
    id="aux"
    v-if="currentLink"
    :class="{'--hide-on-mobile': hidingListOnMobile}"
  >
    <div id="site-info">
      <nav id="site-nav">
        <button @click="previous">&laquo; previous</button>
        <button @click="random">random</button>
        <button @click="next">next &raquo;</button>
        <button @click="showList" id="show-list-button">list</button>
      </nav>
      <h2>{{ currentLink.text }}</h2>
      <p>
        <a :href="currentLink.url" class="info-link">
          <img
            v-if="currentSiteData"
            style="max-width: 100%"
            :src="currentSiteData.desktopImageUrl"
          />
          <span class="info-link__visit">
            <span class="info-link__text">เข้าชมเว็บไซต์</span>
          </span>
        </a>
      </p>
    </div>
  </div>`,
  setup() {
    const currentLink = Vue.ref()
    const hidingListOnMobile = Vue.ref(true)
    const links = Array.from(document.querySelectorAll("#ring > li")).map(
      (li) => {
        const id = li.id
        const a = li.querySelector("a")
        const url = a.href
        const text = a.innerText
        const select = () => {
          currentLink.value = link
          hidingListOnMobile.value = false
          location.hash = "#" + id
        }
        const link = Vue.reactive({ id, text, url, a, li, select })
        a.addEventListener("click", (e) => {
          e.preventDefault()
          select()
        })
        return link
      }
    )

    const updateCurrentLink = () => {
      const hash = location.hash
      const found = links.find((l) => "#" + l.id === hash)
      if (found) {
        currentLink.value = found
        hidingListOnMobile.value = false
      } else if (hash === "#list") {
        hidingListOnMobile.value = true
      }
    }

    const previous = () => {
      let index = links.indexOf(currentLink.value)
      if (index === -1) index = 0
      index = (index + links.length - 1) % links.length
      links[index].select()
    }
    const random = () => {
      links[~~(Math.random() * links.length)].select()
    }
    const next = () => {
      let index = (links.indexOf(currentLink.value) + 1) % links.length
      links[index].select()
    }

    const currentSiteData = Vue.computed(() => {
      return currentLink.value && siteData[currentLink.value.id]
    })
    const showList = () => {
      hidingListOnMobile.value = true
      location.hash = "#list"
    }

    Vue.onMounted(() => {
      updateCurrentLink()
      if (!currentLink.value && location.hash !== "#list") {
        random()
      }
      window.addEventListener("hashchange", () => {
        updateCurrentLink()
      })
      requestAnimationFrame(() => {
        hidingListOnMobile.value = false
      })
    })

    Vue.onMounted(async () => {
      const response = await fetch(
        "https://wonderfulsoftware.github.io/webring-site-data/data.json"
      )
      if (!response.ok) {
        throw new Error("Unable to fetch site data")
      }
      const data = await response.json()
      Object.assign(siteData, data)
    })

    Vue.watch(
      () => currentLink.value,
      (currentLink, previousLink) => {
        if (previousLink) {
          previousLink.li.removeAttribute("data-was-selected")
        }
        if (currentLink) {
          currentLink.li.setAttribute("data-was-selected", "1")
        }
      }
    )

    return {
      previous,
      random,
      next,
      currentLink,
      currentSiteData,
      showList,
      hidingListOnMobile,
    }
  },
})

const instance = app.mount("#app")
