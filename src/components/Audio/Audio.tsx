import { ServerAPI } from "decky-frontend-lib";
import { useEffect, useRef } from "react";

type AudioViewProps = {
  serverAPI: ServerAPI;
  appId: number;
}

export const AudioView = ({ appId, serverAPI }: AudioViewProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const getData = async () => {
      let output = await serverAPI.callPluginMethod("get_sound_url", { game_id: appId, game_name: "" });
      if (!output.success) {
        return;
      }
      if (audioRef.current) {
        audioRef.current.src = output.result;
        audioRef.current.load();
        audioRef.current.play();
      } else {
        console.debug(`No audio found for ${appId}`)
      }
    };
    console.debug(appId);
    if (appId) {
        getData();
      }
    }, [appId]);
  return (
    <audio autoPlay ref={audioRef}>
      <source src=""></source>
    </audio>
  );
};
