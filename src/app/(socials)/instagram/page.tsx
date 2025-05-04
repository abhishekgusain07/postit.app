import { InstagramManager } from "@/components/instagrammanager"

const InstagramPage = () => {
    return (
        <div>
            <InstagramManager 
                clientId={process.env.FACEBOOK_CLIENT_ID || ''}
                clientSecret={process.env.FACEBOOK_CLIENT_SECRET || ''}
                redirectUri={process.env.FACEBOOK_REDIRECT_URI || ''}
            />
        </div>
    )
}

export default InstagramPage;