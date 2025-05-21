import './appsection.css'

function AppSection() {
    return (
        <div className='appsection'>
            <div className='text_section'>
                <h1>GET OUR APP!</h1>
                <p>Experience the convenience of our app.</p>
                <p>Coming soon in mid July 2025</p>
                {/* <div className='store_images'>
                    <div className='apple'>
                        <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share'
                           target='_blank'>
                            <img src='/swift_eats/images/appstore_img.png' alt='Image of apple'></img>
                        </a>
                    </div>
                    <div className='google_play'>
                        <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share'
                           target='_blank'>
                            <img src='/swift_eats/images/googleplay_img.png' alt='Image of google play'></img>
                        </a>
                    </div>
                </div> */}
            </div>
            <div className='app_image'>
                <img src='/swift_eats/images/app_preview_transparent.png' alt='image of app on iphone' width={302}
                     height={400}></img>
            </div>
        </div>
    )
}

export default AppSection
