// 随机背景图函数
export function getRandomBackgroundImage() {
  const bgList = [
    "https://ucarecdn.com/14b71651-4631-497c-b597-c07b5496a565/-/preview/372x1000/",
    "https://ucarecdn.com/44c66aa6-1766-4b21-89f4-3f0620bb65bb/-/preview/426x1000/",
    "https://ucarecdn.com/f731ac27-2ce6-4c58-a0aa-cc6b2117713d/-/preview/483x1000/",
  ];
  // const imgIndex = Math.floor(Math.random() * bgList.length);
  const currentHour = new Date().getHours();
  if (currentHour >= 0 && currentHour < 8) {
    return bgList[0];
  } else if (currentHour >= 8 && currentHour < 16) {
    return bgList[1];
  } else {
    return bgList[2];
  }
}