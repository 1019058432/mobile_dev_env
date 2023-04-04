// import routes from "@/router/index";
export default defineAppConfig({
  pages: ['pages/index/index'],
  // subPackages: [
  //   {
  //     root: "subpackages/packageA",
  //     pages: ["index/index"]
  //   },
  //   {
  //     root: "subpackages/packageB",
  //     pages: ["index/index"]
  //   }
  // ],
  navigateToMiniProgramAppIdList: [''],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
})
