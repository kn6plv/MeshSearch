class ExtractTitle {

  constructor(page) {
    this.page = page;
    this.run();
  }

  run() {
    if (this.page.html) {
      this.title = (this.page.html.querySelector('title') || {}).text;
    }
  }
}

module.exports = ExtractTitle;
