/**
 * RHND Media Embed Utility v3.7
 * Supports TikTok, Instagram, Facebook, YouTube, and direct MP4/video files.
 * Provides clean, error-free presentation without broken iframes.
 */
(function(window) {
    'use strict';

    const RHND_MEDIA = {

        /**
         * Parse any media URL and return metadata & embed information.
         * @param {string} url
         * @returns {object|null}
         */
        parse: function(url) {
            if (!url || typeof url !== 'string') return null;
            url = url.trim();
            if (!url) return null;

            // 1. YouTube
            var ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.*[&?]v=|shorts\/))([A-Za-z0-9_-]{11})/);
            if (ytMatch && ytMatch[1]) {
                var ytId = ytMatch[1];
                return {
                    type: 'youtube',
                    id: ytId,
                    url: url,
                    embedUrl: 'https://www.youtube.com/embed/' + ytId,
                    thumbnail: 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg',
                    name: 'YouTube',
                    icon: 'fab fa-youtube',
                    brandColor: '#dc2626',
                    bgColor: '#fee2e2'
                };
            }

            // 2. TikTok
            var ttLong = url.match(/tiktok\.com\/@[^/?#\s]+\/(?:video|photo)\/(\d+)/);
            var ttV    = url.match(/tiktok\.com\/v\/(\d+)/);
            var ttShort = url.match(/(?:vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t)\/([A-Za-z0-9_-]+)/);
            var ttIdMatch = ttLong || ttV;
            if (ttIdMatch || ttShort || url.indexOf('tiktok.com') !== -1) {
                var ttVideoId = ttIdMatch ? ttIdMatch[1] : (ttShort ? ttShort[1] : null);
                return {
                    type: 'tiktok',
                    id: ttVideoId,
                    url: url,
                    embedUrl: null,
                    thumbnail: null,
                    name: 'TikTok',
                    icon: 'fab fa-tiktok',
                    brandColor: '#000000',
                    bgColor: '#f4f4f5'
                };
            }

            // 3. Instagram
            var igMatch = url.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
            if (igMatch && igMatch[1]) {
                var igCode = igMatch[1];
                return {
                    type: 'instagram',
                    id: igCode,
                    url: url,
                    embedUrl: null,
                    thumbnail: null,
                    name: 'Instagram',
                    icon: 'fab fa-instagram',
                    brandColor: '#db2777',
                    bgColor: '#fdf2f8'
                };
            }

            // 4. Facebook
            if (url.match(/(?:facebook\.com|fb\.watch|fb\.gg)/)) {
                return {
                    type: 'facebook',
                    id: null,
                    url: url,
                    embedUrl: null,
                    thumbnail: null,
                    name: 'Facebook',
                    icon: 'fab fa-facebook-f',
                    brandColor: '#1877f2',
                    bgColor: '#eff6ff'
                };
            }

            // 5. Direct Video (MP4, WebM, Cloudinary, etc.)
            return {
                type: 'direct',
                id: null,
                url: url,
                embedUrl: url,
                thumbnail: null,
                name: 'Video',
                icon: 'fas fa-video',
                brandColor: '#2563eb',
                bgColor: '#eff6ff'
            };
        },

        getBadgeHtml: function(videoUrl) {
            var media = this.parse(videoUrl);
            if (!media) return '';
            switch (media.type) {
                case 'tiktok':
                    return '<span style="background:#000;color:#fff;padding:2px 7px;border-radius:4px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fab fa-tiktok" style="color:#00f2fe;"></i> TikTok</span>';
                case 'instagram':
                    return '<span style="background:linear-gradient(45deg,#f09433,#dc2743,#bc1888);color:#fff;padding:2px 7px;border-radius:4px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fab fa-instagram"></i> Instagram</span>';
                case 'facebook':
                    return '<span style="background:#1877f2;color:#fff;padding:2px 7px;border-radius:4px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fab fa-facebook-f"></i> Facebook</span>';
                case 'youtube':
                    return '<span style="background:#dc2626;color:#fff;padding:2px 7px;border-radius:4px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fab fa-youtube"></i> YouTube</span>';
                default:
                    return '<span style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;padding:2px 7px;border-radius:4px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-video"></i> Video Attached</span>';
            }
        },

        getCardMediaHtml: function(post, heightPx) {
            heightPx = heightPx || 190;
            if (!post || !post.video) return '';
            var media = this.parse(post.video);
            if (!media) return '';

            var clickFn = "event.stopPropagation(); if(typeof openNewsArticle==='function') openNewsArticle(" + post.id + "); else if(typeof openHomeNewsArticle==='function') openHomeNewsArticle(" + post.id + "); else if(typeof openMediaArticle==='function') openMediaArticle(" + post.id + ");";

            if (media.type === 'youtube' && media.thumbnail) {
                return '<div style="width:100%;height:' + heightPx + 'px;overflow:hidden;background:#000;position:relative;cursor:pointer;" onclick="' + clickFn + '">' +
                    '<img src="' + media.thumbnail + '" alt="YouTube Video" style="width:100%;height:100%;object-fit:cover;">' +
                    '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">' +
                        '<div style="width:50px;height:50px;border-radius:50%;background:#dc2626;color:white;display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 4px 15px rgba(0,0,0,0.6);"><i class="fas fa-play" style="margin-left:3px;"></i></div>' +
                    '</div>' +
                    '<div style="position:absolute;bottom:10px;left:10px;"><span style="background:rgba(220,38,38,0.95);color:white;padding:3px 8px;border-radius:4px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fab fa-youtube"></i> YouTube</span></div>' +
                '</div>';
            }

            if (media.type === 'tiktok') {
                return '<div style="width:100%;height:' + heightPx + 'px;background:linear-gradient(135deg,#050505 0%,#18181b 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;border-bottom:3px solid #00f2fe;cursor:pointer;" onclick="' + clickFn + '">' +
                    '<div style="width:52px;height:52px;border-radius:50%;background:#27272a;display:flex;align-items:center;justify-content:center;color:#00f2fe;font-size:1.5rem;margin-bottom:8px;box-shadow:0 0 15px rgba(0,242,254,0.3);border:1px solid #3f3f46;"><i class="fab fa-tiktok"></i></div>' +
                    '<span style="color:#ffffff;font-size:0.95rem;font-weight:800;letter-spacing:0.3px;">TikTok Official Video</span>' +
                    '<span style="background:linear-gradient(90deg,#00f2fe,#fe2c55);color:#000;padding:3px 12px;border-radius:20px;font-size:0.72rem;font-weight:800;margin-top:6px;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-play" style="font-size:0.6rem;"></i> Watch Video</span>' +
                    '<div style="position:absolute;bottom:8px;left:8px;"><span style="background:rgba(0,0,0,0.85);color:#fff;padding:2px 7px;border-radius:4px;font-size:0.68rem;font-weight:700;"><i class="fab fa-tiktok" style="color:#00f2fe;"></i> TikTok</span></div>' +
                '</div>';
            }

            if (media.type === 'instagram') {
                return '<div style="width:100%;height:' + heightPx + 'px;background:linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;" onclick="' + clickFn + '">' +
                    '<div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.25);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;color:white;font-size:1.5rem;margin-bottom:8px;box-shadow:0 4px 15px rgba(0,0,0,0.25);"><i class="fab fa-instagram"></i></div>' +
                    '<span style="color:white;font-size:0.95rem;font-weight:800;letter-spacing:0.3px;">Instagram Reel</span>' +
                    '<span style="background:rgba(255,255,255,0.9);color:#bc1888;padding:3px 12px;border-radius:20px;font-size:0.72rem;font-weight:800;margin-top:6px;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-play" style="font-size:0.6rem;"></i> Watch Reel</span>' +
                    '<div style="position:absolute;bottom:8px;left:8px;"><span style="background:rgba(0,0,0,0.5);color:#fff;padding:2px 7px;border-radius:4px;font-size:0.68rem;font-weight:700;"><i class="fab fa-instagram"></i> Instagram</span></div>' +
                '</div>';
            }

            if (media.type === 'facebook') {
                return '<div style="width:100%;height:' + heightPx + 'px;background:linear-gradient(135deg,#1877f2 0%,#0c4a9e 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;" onclick="' + clickFn + '">' +
                    '<div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:white;font-size:1.5rem;margin-bottom:8px;box-shadow:0 4px 15px rgba(0,0,0,0.25);"><i class="fab fa-facebook-f"></i></div>' +
                    '<span style="color:white;font-size:0.95rem;font-weight:800;letter-spacing:0.3px;">Facebook Video</span>' +
                    '<span style="background:rgba(255,255,255,0.9);color:#1877f2;padding:3px 12px;border-radius:20px;font-size:0.72rem;font-weight:800;margin-top:6px;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-play" style="font-size:0.6rem;"></i> Watch Video</span>' +
                    '<div style="position:absolute;bottom:8px;left:8px;"><span style="background:rgba(0,0,0,0.5);color:#fff;padding:2px 7px;border-radius:4px;font-size:0.68rem;font-weight:700;"><i class="fab fa-facebook-f"></i> Facebook</span></div>' +
                '</div>';
            }

            return '<div style="width:100%;height:' + heightPx + 'px;background:#000;overflow:hidden;position:relative;" onclick="event.stopPropagation()">' +
                '<video controls playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;display:block;background:#000;" src="' + post.video + '">Your browser does not support HTML video.</video>' +
            '</div>';
        },

        getModalEmbedHtml: function(videoUrl) {
            var media = this.parse(videoUrl);
            if (!media) return '';

            if (media.type === 'youtube') {
                return '<div style="margin:0 0 20px 0;">' +
                    '<div style="border-radius:12px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0;background:#000;box-shadow:0 4px 20px rgba(0,0,0,0.25);">' +
                        '<iframe src="' + media.embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>' +
                    '</div>' +
                    '<div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
                        '<span style="font-size:0.88rem;color:#64748b;font-weight:700;"><i class="fab fa-youtube" style="color:#dc2626;"></i> YouTube Video</span>' +
                        '<a href="' + media.url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#dc2626;color:white;border-radius:8px;font-weight:800;font-size:0.85rem;text-decoration:none;"><i class="fab fa-youtube"></i> Watch on YouTube <i class="fas fa-external-link-alt" style="font-size:0.7rem;"></i></a>' +
                    '</div>' +
                '</div>';
            }

            if (media.type === 'tiktok') {
                return '<div style="margin:0 0 20px 0;">' +
                    '<div style="background:linear-gradient(135deg,#050505 0%,#18181b 50%,#000000 100%);border:2px solid #27272a;border-radius:16px;padding:32px 20px;text-align:center;color:white;box-shadow:0 10px 30px rgba(0,242,254,0.15);position:relative;overflow:hidden;">' +
                        '<div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;background:#00f2fe;filter:blur(60px);opacity:0.2;border-radius:50%;"></div>' +
                        '<div style="position:absolute;bottom:-40px;left:-40px;width:120px;height:120px;background:#fe2c55;filter:blur(60px);opacity:0.2;border-radius:50%;"></div>' +
                        '<div style="width:64px;height:64px;border-radius:50%;background:#18181b;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#00f2fe;border:2px solid #3f3f46;box-shadow:0 0 20px rgba(0,242,254,0.3);"><i class="fab fa-tiktok"></i></div>' +
                        '<h3 style="margin:0 0 6px;font-size:1.3rem;color:#ffffff;font-weight:800;">Official TikTok Video Update</h3>' +
                        '<p style="margin:0 0 20px;color:#a1a1aa;font-size:0.92rem;max-width:440px;margin-left:auto;margin-right:auto;">Click below to watch this official broadcast directly on TikTok with full audio and interaction.</p>' +
                        '<a href="' + media.url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 32px;background:linear-gradient(90deg,#00f2fe 0%,#fe2c55 100%);color:#000;border-radius:30px;font-weight:900;font-size:1rem;text-decoration:none;box-shadow:0 4px 20px rgba(254,44,85,0.4);transition:transform 0.2s ease;"><i class="fab fa-tiktok" style="font-size:1.15rem;"></i> Watch Video on TikTok <i class="fas fa-external-link-alt" style="font-size:0.8rem;"></i></a>' +
                    '</div>' +
                '</div>';
            }

            if (media.type === 'instagram') {
                return '<div style="margin:0 0 20px 0;">' +
                    '<div style="background:linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);border-radius:16px;padding:32px 20px;text-align:center;color:white;box-shadow:0 10px 30px rgba(220,39,67,0.25);position:relative;overflow:hidden;">' +
                        '<div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.25);backdrop-filter:blur(6px);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:white;box-shadow:0 4px 15px rgba(0,0,0,0.2);"><i class="fab fa-instagram"></i></div>' +
                        '<h3 style="margin:0 0 6px;font-size:1.3rem;color:#ffffff;font-weight:800;">Official Instagram Reel / Post</h3>' +
                        '<p style="margin:0 0 20px;color:rgba(255,255,255,0.9);font-size:0.92rem;max-width:440px;margin-left:auto;margin-right:auto;">Click below to watch this official update directly on Instagram.</p>' +
                        '<a href="' + media.url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 32px;background:#ffffff;color:#bc1888;border-radius:30px;font-weight:900;font-size:1rem;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,0.2);"><i class="fab fa-instagram" style="font-size:1.15rem;"></i> Watch Reel on Instagram <i class="fas fa-external-link-alt" style="font-size:0.8rem;"></i></a>' +
                    '</div>' +
                '</div>';
            }

            if (media.type === 'facebook') {
                return '<div style="margin:0 0 20px 0;">' +
                    '<div style="background:linear-gradient(135deg,#1877f2 0%,#0c4a9e 100%);border-radius:16px;padding:32px 20px;text-align:center;color:white;box-shadow:0 10px 30px rgba(24,119,242,0.25);position:relative;overflow:hidden;">' +
                        '<div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:white;box-shadow:0 4px 15px rgba(0,0,0,0.2);"><i class="fab fa-facebook-f"></i></div>' +
                        '<h3 style="margin:0 0 6px;font-size:1.3rem;color:#ffffff;font-weight:800;">Official Facebook Video</h3>' +
                        '<p style="margin:0 0 20px;color:rgba(255,255,255,0.9);font-size:0.92rem;max-width:440px;margin-left:auto;margin-right:auto;">Click below to watch this official broadcast directly on Facebook.</p>' +
                        '<a href="' + media.url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 32px;background:#ffffff;color:#1877f2;border-radius:30px;font-weight:900;font-size:1rem;text-decoration:none;box-shadow:0 4px 15px rgba(0,0,0,0.2);"><i class="fab fa-facebook-f" style="font-size:1.15rem;"></i> Watch Video on Facebook <i class="fas fa-external-link-alt" style="font-size:0.8rem;"></i></a>' +
                    '</div>' +
                '</div>';
            }

            return '<div style="margin:0 0 20px 0;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 4px 15px rgba(0,0,0,0.15);">' +
                '<video controls playsinline style="width:100%;max-height:380px;display:block;" src="' + media.url + '">Your browser does not support HTML video.</video>' +
            '</div>';
        },

        renderAdminPreview: function(containerId, url) {
            var container = document.getElementById(containerId);
            if (!container) return;

            if (!url) {
                container.style.display = 'none';
                container.innerHTML = '';
                return;
            }

            var media = this.parse(url);
            if (!media) {
                container.style.display = 'none';
                return;
            }

            var previewInner = '';

            if (media.type === 'youtube') {
                previewInner = '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000;margin-top:6px;">' +
                    '<iframe src="' + media.embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>' +
                '</div>';
            } else if (media.type === 'tiktok') {
                previewInner = '<div style="background:linear-gradient(135deg,#050505,#18181b);border:1px solid #27272a;border-radius:8px;padding:14px;text-align:center;color:white;margin-top:6px;">' +
                    '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px;">' +
                        '<i class="fab fa-tiktok" style="font-size:1.3rem;color:#00f2fe;"></i>' +
                        '<strong style="font-size:0.9rem;color:#fff;">TikTok Video Link Attached</strong>' +
                    '</div>' +
                    '<small style="color:#a1a1aa;font-size:0.75rem;word-break:break-all;display:block;margin-bottom:10px;">' + media.url + '</small>' +
                    '<a href="' + media.url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:linear-gradient(90deg,#00f2fe,#fe2c55);color:#000;border-radius:6px;font-weight:800;font-size:0.78rem;text-decoration:none;"><i class="fab fa-tiktok"></i> Test Link in TikTok <i class="fas fa-external-link-alt" style="font-size:0.65rem;"></i></a>' +
                '</div>';
            } else if (media.type === 'instagram') {
                previewInner = '<div style="background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:8px;padding:14px;text-align:center;color:white;margin-top:6px;">' +
                    '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px;">' +
                        '<i class="fab fa-instagram" style="font-size:1.3rem;color:#fff;"></i>' +
                        '<strong style="font-size:0.9rem;color:#fff;">Instagram Reel Link Attached</strong>' +
                    '</div>' +
                    '<small style="color:rgba(255,255,255,0.85);font-size:0.75rem;word-break:break-all;display:block;margin-bottom:10px;">' + media.url + '</small>' +
                    '<a href="' + media.url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:#fff;color:#bc1888;border-radius:6px;font-weight:800;font-size:0.78rem;text-decoration:none;"><i class="fab fa-instagram"></i> Test Link in Instagram <i class="fas fa-external-link-alt" style="font-size:0.65rem;"></i></a>' +
                '</div>';
            } else if (media.type === 'facebook') {
                previewInner = '<div style="background:linear-gradient(135deg,#1877f2,#0c4a9e);border-radius:8px;padding:14px;text-align:center;color:white;margin-top:6px;">' +
                    '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px;">' +
                        '<i class="fab fa-facebook-f" style="font-size:1.3rem;color:#fff;"></i>' +
                        '<strong style="font-size:0.9rem;color:#fff;">Facebook Video Link Attached</strong>' +
                    '</div>' +
                    '<small style="color:rgba(255,255,255,0.85);font-size:0.75rem;word-break:break-all;display:block;margin-bottom:10px;">' + media.url + '</small>' +
                    '<a href="' + media.url + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:#fff;color:#1877f2;border-radius:6px;font-weight:800;font-size:0.78rem;text-decoration:none;"><i class="fab fa-facebook-f"></i> Test Link in Facebook <i class="fas fa-external-link-alt" style="font-size:0.65rem;"></i></a>' +
                '</div>';
            } else {
                previewInner = '<video controls playsinline style="width:100%;max-height:140px;border-radius:8px;background:#000;display:block;margin-top:6px;" src="' + media.url + '">Your browser does not support HTML video.</video>';
            }

            var prefixKey = containerId.replace('-preview', '');
            container.innerHTML =
                '<div style="position:relative;margin-top:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding-right:30px;">' +
                        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                            this.getBadgeHtml(media.url) +
                            '<span style="font-size:0.76rem;color:#16a34a;font-weight:700;"><i class="fas fa-check-circle"></i> Ready to Publish</span>' +
                        '</div>' +
                    '</div>' +
                    previewInner +
                    '<button type="button" onclick="clearMedia(\'' + prefixKey + '\')" style="position:absolute;top:10px;right:10px;background:#dc2626;color:white;border:none;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:0.85rem;z-index:10;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(220,38,38,0.3);" title="Remove Video">&times;</button>' +
                '</div>';
            container.style.display = 'block';
        }
    };

    window.RHND_MEDIA = RHND_MEDIA;
})(window);
