export default function injectBodyPlugin() {
    return {
        name: 'inject-body',
        enforce: 'post',
        transformIndexHtml(html) {
            const hasModuleScript = /<script type="module" crossorigin[^>]*src="[^"]*"[^>]*><\/script>/.test(html)
            const hasLinkCSS = /<link rel="stylesheet" crossorigin[^>]*href="[^"]*"[^>]*>/.test(html)
            if (!hasModuleScript && !hasLinkCSS) return html
            let movedHead = html
            const scripts = []
            const links = []
            movedHead = movedHead.replace(/<script type="module" crossorigin[^>]*src="([^"]*)"[^>]*><\/script>/g, (match) => {
                scripts.push(`<script type="module" src="${match.match(/src="([^"]*)"/)[1]}"></script>`)
                return ''
            })
            movedHead = movedHead.replace(/<link rel="stylesheet" crossorigin[^>]*href="([^"]*)"[^>]*>/g, (match) => {
                links.push(`<link rel="stylesheet" href="${match.match(/href="([^"]*)"/)[1]}">`)
                return ''
            })
            const insert = [...links, ...scripts].join('\n  ')
            return movedHead.replace('</body>', `  ${insert}\n</body>`)
        }
    }
}
