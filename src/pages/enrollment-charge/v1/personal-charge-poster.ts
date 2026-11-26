// Adapted from WOne PC's personal charge poster. The exported artwork uses
// fixed print colors so it looks the same when saved from either theme.
const paymentLogo = `${import.meta.env.BASE_URL}pages/enrollment-charge/v1/wechat-pay-lockup.png`;
const bodyFont = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
const numberFont = '"DIN Alternate", "Arial Narrow", "Helvetica Neue", Arial, sans-serif';

async function loadImage(source: string) {
  const image = new Image();
  image.src = source;
  await image.decode();
  return image;
}

export async function createPersonalChargePoster(qrSource: string, campus: string, amount: number | null) {
  const [qr, logo] = await Promise.all([loadImage(qrSource), loadImage(paymentLogo)]);
  const canvas = document.createElement('canvas');
  const width = 828;
  const height = 1124;
  const scale = 1080 / width;
  canvas.width = 1080;
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');

  context.scale(scale, scale);
  context.fillStyle = '#f28c28';
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#fff';
  context.beginPath();
  context.moveTo(0, 930);
  context.quadraticCurveTo(width / 2, 875, width, 930);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `500 53px ${bodyFont}`;
  const centerX = width / 2;
  context.fillText('推荐使用微信支付', centerX, 106);

  const cardWidth = 508;
  const cardCenterY = 508;
  const verticalPadding = 48;
  const rowGap = 16;
  const amountHeight = 64;
  const campusHeight = 32;
  const qrSize = 354;
  const amountSpace = amount === null ? 0 : amountHeight + rowGap;
  const cardHeight = verticalPadding * 2 + amountSpace + qrSize + rowGap + campusHeight;
  const cardTop = cardCenterY - cardHeight / 2;
  const contentTop = cardTop + verticalPadding;
  const qrTop = contentTop + amountSpace;
  context.beginPath();
  context.roundRect(centerX - cardWidth / 2, cardTop, cardWidth, cardHeight, 24);
  context.fill();

  if (amount !== null) {
    context.fillStyle = '#121212';
    context.font = `700 52px ${numberFont}`;
    context.fillText(`¥${amount.toFixed(2)}`, centerX, contentTop + amountHeight / 2);
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(qr, centerX - qrSize / 2, qrTop, qrSize, qrSize);
  context.imageSmoothingEnabled = true;

  context.fillStyle = '#202020';
  context.font = `400 22px ${bodyFont}`;
  context.fillText(campus, centerX, qrTop + qrSize + rowGap + campusHeight / 2, cardWidth - verticalPadding);

  context.drawImage(logo, 219, 965, 390, 105);
  return canvas.toDataURL('image/png');
}
