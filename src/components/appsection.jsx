import './appsection.css'

function AppSection() {
    return (
        <div className='appsection'>
            <div className='text_section'>
                <p>Download our app</p>
                <div className='store_images'>
                    <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share' target='_blank'>
                        <img src='/images/appstore_img.png' alt='Image of app'></img>
                    </a>
                    <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share' target='_blank'>
                        <img src='/swift_eats/images/googleplay_img.png' alt='Image of app'></img>
                    </a>
                </div>
            </div>
            <div className='app_image'>
                <img src='/swift_eats/images/app_iphone_cutoff.png' alt='image of app on iphone' width={302} height={400}></img>
            </div>
        </div>
    )
}

export default AppSection
