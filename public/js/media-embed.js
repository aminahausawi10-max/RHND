/**
 * RHND Media Embed Utility v4.1
 * Supports TikTok, Instagram, Facebook, YouTube, and direct MP4/video files.
 * Provides clean, error-free presentation without intrusive logos on cards.
 */
(function(window) {
    'use strict';

    const RHND_MEDIA = {

        /**
         * Parse any media URL and return metadata & embed information.
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
                    embedUrl: 'https://www.youtube.com/embed/' + ytId + '?rel=0&modestbranding=1&showinfo=0',
                    thumbnail: 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg'
                };
            }

            // 2. TikTok
            var ttLong = url.match(/tiktok\.com\/@[^/?#\s]+\/(?:video|photo)\/(\d+)/);
            var ttV    = url.match(/tiktok\.com\/v\/(\d+)/);
            var ttShort = url.match(/(?:vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t)\/([A-Za-z0-9_-]+)/);
            var ttIdMatch = ttLong || ttV;
            if (ttIdMatch || ttShort || url.indexOf('tiktok.com') !== -1) {
                var ttVideoId = ttIdMatch ? ttIdMatch[1] : (ttShort ? ttShort[1] : null);
                var ttEmbedUrl = ttIdMatch ? ('https://www.tiktok.com/embed/v2/' + ttIdMatch[1]) : null;
                return {
                    type: 'tiktok',
                    id: ttVideoId,
                    url: url,
                    embedUrl: ttEmbedUrl
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
                    embedUrl: 'https://www.instagram.com/reel/' + igCode + '/embed/'
                };
            }

            // 4. Facebook
            if (url.match(/(?:facebook\.com|fb\.watch|fb\.gg)/)) {
                return {
                    type: 'facebook',
                    id: null,
                    url: url,
                    embedUrl: 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(url) + '&show_text=0&width=500'
                };
            }

            // 5. Direct Video
            return {
                type: 'direct',
                id: null,
                url: url,
                embedUrl: url
            };
        },

        getBadgeHtml: function(videoUrl) {
            var media = this.parse(videoUrl);
            if (!media) return '';
            return '<span style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;padding:2px 7px;border-radius:4px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-play-circle"></i> Video</span>';
        },

        getCardMediaHtml: function(post, heightPx) {
            heightPx = heightPx || 190;
            if (!post || !post.video) return '';
            var media = this.parse(post.video);
            if (!media) return '';

            var clickFn = "event.stopPropagation(); if(typeof openNewsArticle==='function') openNewsArticle(" + post.id + "); else if(typeof openHomeNewsArticle==='function') openHomeNewsArticle(" + post.id + "); else if(typeof openMediaArticle==='function') openMediaArticle(" + post.id + ");";

            if (media.type === 'youtube' && media.thumbnail) {
                return '<div style="width:100%;height:' + heightPx + 'px;overflow:hidden;background:#000;position:relative;cursor:pointer;" onclick="' + clickFn + '">' +
                    '<img src="' + media.thumbnail + '" alt="Video" style="width:100%;height:100%;object-fit:cover;">' +
                    '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">' +
                        '<div style="width:50px;height:50px;border-radius:50%;background:#2563eb;color:white;display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 4px 15px rgba(0,0,0,0.6);"><i class="fas fa-play" style="margin-left:3px;"></i></div>' +
                    '</div>' +
                '</div>';
            }

            if (media.type === 'tiktok' || media.type === 'instagram' || media.type === 'facebook') {
                return '<div style="width:100%;height:' + heightPx + 'px;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;" onclick="' + clickFn + '">' +
                    '<div style="width:52px;height:52px;border-radius:50%;background:#1e293b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;margin-bottom:8px;border:1px solid #334155;"><i class="fas fa-play" style="margin-left:4px;"></i></div>' +
                    '<span style="color:#cbd5e1;font-size:0.85rem;font-weight:600;">Click to watch video</span>' +
                '</div>';
            }

            // Direct videos
            return '<div style="width:100%;height:' + heightPx + 'px;background:#000;overflow:hidden;position:relative;" onclick="event.stopPropagation()">' +
                '<video controls playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;display:block;background:#000;" src="' + post.video + '">Your browser does not support HTML video.</video>' +
            '</div>';
        },

        getModalEmbedHtml: function(videoUrl) {
            var media = this.parse(videoUrl);
            if (!media) return '';

            if (media.type === 'youtube' && media.embedUrl) {
                return '<div style="margin:0 0 20px 0;">' +
                    '<div style="border-radius:12px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0;background:#000;box-shadow:0 4px 20px rgba(0,0,0,0.25);">' +
                        '<iframe src="' + media.embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>' +
                    '</div>' +
                '</div>';
            }

            if (media.type === 'tiktok') {
                this.ensureThirdPartyScripts();
                if (media.embedUrl) {
                    return '<div style="margin:0 0 20px 0;width:100%;border-radius:12px;overflow:hidden;background:#000;display:flex;justify-content:center;">' +
                        '<iframe src="' + media.embedUrl + '" style="width:100%;max-width:325px;height:600px;border:none;" allowfullscreen></iframe>' +
                    '</div>';
                }
                return '<div style="margin:0 0 20px 0;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.15);"><blockquote class="tiktok-embed" cite="' + media.url + '" data-video-id="' + media.id + '" style="max-width:100%;min-width:325px;"><section></section></blockquote></div>';
            }

            if (media.type === 'instagram') {
                this.ensureThirdPartyScripts();
                return '<div style="margin:0 0 20px 0;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 4px 15px rgba(0,0,0,0.15);"><blockquote class="instagram-media" data-instgrm-permalink="' + media.url + '" data-instgrm-version="14" style="background:#FFF;border:0;margin:1px;max-width:100%;min-width:326px;padding:0;width:99%;"><section></section></blockquote></div>';
            }

            if (media.type === 'facebook') {
                return '<div style="margin:0 0 20px 0;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 4px 15px rgba(0,0,0,0.15);display:flex;justify-content:center;">' +
                    '<iframe src="' + media.embedUrl + '" style="width:100%;height:400px;border:none;overflow:hidden;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>' +
                '</div>';
            }

            // Direct videos
            return '<div style="margin:0 0 20px 0;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 4px 15px rgba(0,0,0,0.15);">' +
                '<video controls playsinline preload="metadata" style="width:100%;max-height:380px;display:block;" src="' + media.url + '">Your browser does not support HTML video.</video>' +
            '</div>';
        },

        renderAdminPreview: function(containerId, url) {
            var container = document.getElementById(containerId);
            if (!container) return;
            if (!url) { container.style.display = 'none'; return; }
            var media = this.parse(url);
            if (!media) { container.style.display = 'none'; return; }

            var previewInner = '';
            if (media.type === 'youtube' || media.type === 'facebook') {
                previewInner = '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000;margin-top:6px;"><iframe src="' + media.embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"></iframe></div>';
            } else if (media.type === 'tiktok' || media.type === 'instagram') {
                var pName = media.type === 'tiktok' ? 'TikTok' : 'Instagram';
                previewInner = '<div style="width:100%;height:140px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;margin-top:6px;">' + pName + ' Link Detected</div>';
            } else {
                previewInner = '<video controls playsinline style="width:100%;max-height:140px;border-radius:8px;background:#000;display:block;margin-top:6px;" src="' + media.url + '"></video>';
            }

            var prefixKey = containerId.replace('-preview', '');
            container.innerHTML =
                '<div style="position:relative;margin-top:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding-right:30px;">' +
                        '<div style="display:flex;align-items:center;gap:8px;">' +
                            this.getBadgeHtml(media.url) +
                            '<span style="font-size:0.76rem;color:#16a34a;font-weight:700;"><i class="fas fa-check-circle"></i> Ready to Publish</span>' +
                        '</div>' +
                    '</div>' + previewInner +
                    '<button type="button" onclick="clearMedia(\'' + prefixKey + '\')" style="position:absolute;top:10px;right:10px;background:#dc2626;color:white;border:none;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:0.85rem;z-index:10;display:flex;align-items:center;justify-content:center;">&times;</button>' +
                '</div>';
            container.style.display = 'block';
        },

        ensureThirdPartyScripts: function() {
            if (!document.getElementById('tiktok-embed-script')) {
                var ttScript = document.createElement('script');
                ttScript.id = 'tiktok-embed-script';
                ttScript.src = 'https://www.tiktok.com/embed.js';
                ttScript.async = true;
                document.body.appendChild(ttScript);
            }
            if (!document.getElementById('ig-embed-script')) {
                var igScript = document.createElement('script');
                igScript.id = 'ig-embed-script';
                igScript.src = 'https://www.instagram.com/embed.js';
                igScript.async = true;
                document.body.appendChild(igScript);
            }
            if (window.instgrm && window.instgrm.Embeds) {
                setTimeout(function() { window.instgrm.Embeds.process(); }, 500);
            }
        }
    };

    window.RHND_MEDIA = RHND_MEDIA;
})(window);
