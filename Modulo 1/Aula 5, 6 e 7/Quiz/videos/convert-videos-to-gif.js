import ffmpeg from "fluent-ffmpeg";
import path from "path";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const videos = [
  "carregando-questoes.mp4",
  "resultado-final.mp4",
];

const outDir = path.join(__dirname, "assets");

videos.forEach((video) => {
  const base = path.basename(video, ".mp4");
  const outGif = path.join(outDir, `${base}.gif`);
  ffmpeg(path.join(__dirname, video))
    .outputOptions([
      "-vf", "fps=10,scale=480:-1:flags=lanczos",
      "-loop", "0",
    ])
    .toFormat("gif")
    .on("end", () => {
      console.log(`Converted ${video} -> ${outGif}`);
    })
    .on("error", (err) => {
      console.error(`Error converting ${video}:`, err.message);
    })
    .save(outGif);
});
