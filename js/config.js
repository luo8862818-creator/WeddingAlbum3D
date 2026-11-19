export const ALBUM_CONFIG = {
  title: "Our Wedding Album",
  names: ["YOUR NAME", "YOUR PARTNER"],
  date: "2026 · FOREVER TOGETHER",
  pageWidth: 620,
  pageHeight: 760,
  flipDuration: 1350,
  autoPlay: true,
  autoPlayDelay: 2200,
  pageHoldMs: 5200,
  music: "",
  placeholderImage: "assets/images/photo-placeholder.svg",
  coverImage: "assets/photos/cover.jpg",
  spreads: [
    {
      left: {
        type: "story",
        eyebrow: "CHAPTER 01 · THE BEGINNING",
        title: "A day to remember",
        body: "从相遇到相爱，从心动到坚定。那些平凡又珍贵的日子，组成了只属于我们的故事。",
        signature: "Our story begins"
      },
      right: {
        type: "photo",
        src: "assets/photos/photo-01.jpg",
        caption: "THE FIRST FRAME",
        number: "01"
      }
    },
    {
      left: {
        type: "photo",
        src: "assets/photos/photo-02.jpg",
        caption: "A QUIET MOMENT",
        number: "02",
        variant: "inset"
      },
      right: {
        type: "photo",
        src: "assets/photos/photo-03.jpg",
        caption: "JUST THE TWO OF US",
        number: "03"
      }
    },
    {
      left: {
        type: "quote",
        title: "Some moments become memories. Some memories become forever.",
        eyebrow: "A LITTLE NOTE"
      },
      right: {
        type: "photo",
        src: "assets/photos/photo-04.jpg",
        caption: "THE WAY YOU LOOK AT ME",
        number: "04"
      }
    },
    {
      left: {
        type: "photo",
        src: "assets/photos/photo-05.jpg",
        caption: "SIDE BY SIDE",
        number: "05"
      },
      right: {
        type: "photo",
        src: "assets/photos/photo-06.jpg",
        caption: "INTO THE LIGHT",
        number: "06",
        variant: "wide"
      }
    },
    {
      left: {
        type: "photo",
        src: "assets/photos/photo-07.jpg",
        caption: "OUR FAVORITE DAY",
        number: "07"
      },
      right: {
        type: "photo",
        src: "assets/photos/photo-08.jpg",
        caption: "TO BE CONTINUED",
        number: "08"
      }
    }
  ]
};
