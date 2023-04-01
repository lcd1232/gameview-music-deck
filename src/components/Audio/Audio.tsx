import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { useEffect, useRef } from "react";
import { Database, getCache, keyDatabase } from "../../hooks/Cache";

type YoutubeResult = {
  data: {
    audio: {
      url: string;
    };
  };
};

type AudioViewProps = {
  serverApi: ServerAPI;
  appId: number;
}

type APIResult = { body: string; status: number };

export const AudioView = ({ appId, serverApi }: AudioViewProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const getData = async () => {
      const database = await getCache<Database>(keyDatabase)
      if (database && database.app_id[`${appId}`]) {
        const videoUrl = database.app_id[`${appId}`].url;
        console.log(`get Audio data for ${appId}`);
        const res: ServerResponse<{ body: string; status: number }> =
          await serverApi.fetchNoCors<{ body: string; status: number }>(
            `https://api.microlink.io/?url=${videoUrl}&audio`,
            {
              method: 'GET',
            }
          );
        const result = res.result as APIResult;
        if (result.status === 200) {
          const data: YoutubeResult = JSON.parse(result.body);
          console.log(data.data.audio.url);
          if (audioRef.current) {
            audioRef.current.src = data.data.audio.url;
            audioRef.current.pause();
            audioRef.current.load();
            audioRef.current.play();
          }
        } else {
          console.error(result);
        }
      } else {
        console.debug(`No audio found for ${appId}`)
      }
    };
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
