const apiData = new Promise(function(resolve, reject) {
  const apiReq = new XMLHttpRequest();
  apiReq.open("GET", "api.json", true);
  apiReq.responseType = "json";
  apiReq.addEventListener("load", function() {
    resolve(this.response);
  });
  apiReq.send();
});


function httpGet(url, type) {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = type;
    xhr.addEventListener("load", function() {
      resolve(this.response);
    });
    xhr.send();
  });
}

var app;

window.addEventListener("load", async function() {
  const data = await apiData;
  const hash = location.hash.substring(1);

  app = new Vue({
    el: 'main',
    data: {
      topics: Object.keys(data).map(topicName => ({
        name: topicName,
        url: data[topicName],
        get isActive() {
          return location.hash.substring(1) === this.name;
        }
      })),
      topicHtml: '',
      loading: false
    },
    methods: {
      showTopic(event) {
        const topicLiItem = event.target.closest("li");
        const topicSrc = data[topicLiItem.dataset.topicName];
        location.hash = topicLiItem.dataset.topicName;
        this.renderTopic(topicSrc);
      },
      async renderTopic(source) {
        app.loading = true;
        const markdownContext = await httpGet(source, "text");
        const html = marked(markdownContext);
        app.topicHtml = html;

        app.loading = false;

        setTimeout(function() {
          const target = document.querySelector(".topic-render");
          for (let pre of target.getElementsByTagName("pre")) {
            pre.classList.add("hljs-highligted");
            let code = pre.getElementsByTagName("code")[0];
            hljs.highlightBlock(code);
          }
        });

      }
    }
  });

  app.renderTopic(data[hash]);
});
