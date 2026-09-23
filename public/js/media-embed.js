/**
 * RHND Media Embed Utility v4.0
 * All videos play directly on the RHND platform using HTML5 video player.
 * No external social media branding (TikTok, Instagram, Facebook, YouTube) is shown.
 */
(function(window) {
    'use strict';

    const RHND_MEDIA = {

        /**
         * Parse any media URL and return metadata.
         * All types are treated as direct video for inline playback.
         * @param {string} url
         * @returns {object|null}
         */
        parse: function(url) {
            if (!url || typeof url !== 'string') return null;
            url = url.trim();
            if (!url) return null;

            // YouTube — extract direct embed URL for iframe playback
            var ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.*[&?]v=|shorts\/))([A-Za-z0-9_-]{11})/);
            if (ytMatch && ytMatch[1]) {
                return {
                    type: 'youtube',
                    id: ytMatch[1],
                    url: url,
                    embedUrl: 'https://www.youtube.com/embed/' + ytMatch[1] + '?rel=0&modestbranding=1&showinfo=0',
                    thumbnail: 'https://img.youtube.com/vi/' + ytMatch[1] + '/hqdefault.jpg',
                    name: 'Video',
                    icon: 'fas fa-play-circle',
                    brandColor: '#2563eb',
                    bgColor: '#eff6ff'
                };
            }

            // All other URLs (TikTok, Instagram, Facebook, direct MP4, etc.)
            // Treat as direct video for HTML5 playback
            return {
                type: 'direct',
                id: null,
                url: url,
                embedUrl: url,
                thumbnail: null,
                name: 'Video',
                icon: 'fas fa-play-circle',
                brandColor: '#2563eb',
                bgColor: '#eff6ff'
            };
        },

        /**
         * Returns a simple "Video" badge — no social media branding.
         */
        getBadgeHtml: function(videoUrl) {
            var media = this.parse(videoUrl);
            if (!media) return '';
            return '<span style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;padding:2px 7px;border-radius:4px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-play-circle"></i> Video</span>';
        },

        /**
         * Card media HTML — always renders inline HTML5 video player.
         * No social media branding or platform-specific styling.
         */
        getCardMediaHtml: function(post, heightPx) {
            heightPx = heightPx || 190;
            if (!post || !post.video) return '';
            var media = this.parse(post.video);
            if (!media) return '';

            // YouTube videos use iframe (but without branding)
            if (media.type === 'youtube' && media.embedUrl) {
                return '<div style="width:100%;height:' + heightPx + 'px;overflow:hidden;background:#000;position:relative;" onclick="event.stopPropagation()">' +
                    '<iframe src="' + media.embedUrl + '" style="width:100%;height:100%;border:none;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>' +
                '</div>';
            }

            // All other videos play directly via HTML5 video element
            return '<div style="width:100%;height:' + heightPx + 'px;background:#000;overflow:hidden;position:relative;" onclick="event.stopPropagation()">' +
                '<video controls playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;display:block;background:#000;" src="' + post.video + '">Your browser does not support HTML video.</video>' +
            '</div>';
        },

        /**
         * Modal embed HTML — plays video directly in the modal.
         * No "Watch on YouTube/TikTok" links or social branding.
         */
        getModalEmbedHtml: function(videoUrl) {
            var media = this.parse(videoUrl);
            if (!media) return '';

            // YouTube videos use iframe (no branding)
            if (media.type === 'youtube' && media.embedUrl) {
                return '<div style="margin:0 0 20px 0;">' +
                    '<div style="border-radius:12px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0;background:#000;box-shadow:0 4px 20px rgba(0,0,0,0.25);">' +
                        '<iframe src="' + media.embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>' +
                    '</div>' +
                '</div>';
            }

            // All other videos play directly via HTML5 video element
            return '<div style="margin:0 0 20px 0;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 4px 15px rgba(0,0,0,0.15);">' +
                '<video controls playsinline preload="metadata" style="width:100%;max-height:380px;display:block;" src="' + media.url + '">Your browser does not support HTML video.</video>' +
            '</div>';
        },

        /**
         * Admin preview — simple video preview without social branding.
         */
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
        },

        // No longer needed — removed third-party embed scripts
        ensureThirdPartyScripts: function() {
            // Intentionally empty — no external social media scripts loaded
        }
    };

    window.RHND_MEDIA = RHND_MEDIA;
})(window);
