import { YouTubeManager } from "@/components/youtubemanager";


const YoutubePage = () => {
    const redirectUri = process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';
    return (
        <div>
            <YouTubeManager
                clientId={process.env.YOUTUBE_CLIENT_ID || ''}
                clientSecret={process.env.YOUTUBE_CLIENT_SECRET || ''}
                redirectUri={redirectUri}
            />
        </div>
    )
}

export default YoutubePage;