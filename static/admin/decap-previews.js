
 CMS.registerPreviewStyle("https://investlincolnshire.co.uk/css/pg-style.min.min.css");

// ── Helpers ────────────────────────────────────────────────────────────────
 
  function resolveImage(val, getAsset) {
    if (!val) return '';
    var asset = getAsset(val);
    var resolved = asset ? asset.toString() : '';
    return resolved || val;
  }
 
  function toArray(immList) {
    return immList ? immList.toArray() : [];
  }
 
  // ── Styles (from locations.html <style> block) ─────────────────────────────
 
  var locationStyles = [
    '.section_header-50-50 { background-color: #2D3137; padding: 0; }',
    'h1.text-sector-mid, .p-large { color: #ffffff; }',
    '.section_header-50-50 .img-wrapper img { width: 98vw; object-fit: fill; }',
    '.bgblack { background-color: #2D3137; padding: 0; }',
    '.mt-sm-5 { margin-top: 0 !important; }',
    '.downloads { padding-top: 5rem; }',
    '.card { height: 96%; }',
    '.card-header img { width: 100%; }',
    'a { text-decoration: none; }',
    '.card-body { display: flex; flex-direction: column; }',
    '.card-body h2 { font-size: 1.25rem; text-align: center; }',
    '.download { text-align: center; color: #0a58ca; }',
    '.download:hover { color: #4b83d8; }'
  ].join('\n');
 
  // ── Card renderer (used for both map and location items) ───────────────────
 
  function renderCard(name, thumbnailSrc, pdf, getAsset) {
    return h('div', { className: 'col-12 col-lg-4 card-wrapper' },
      h('a', { href: pdf || '#', download: pdf || '' },
        h('div', { className: 'card shadow' },
          h('div', { className: 'card-header' },
            thumbnailSrc
              ? h('img', { src: thumbnailSrc, alt: name || '' })
              : null
          ),
          h('div', { className: 'card-body justify-content-between' },
            h('h2', { className: 'm-0 text-green' }, name || ''),
            h('h5', { className: 'download' }, 'Download')
          )
        )
      )
    );
  }
 
  // ── Hero (reusing the same pattern as homePreviewTemplate) ─────────────────
 
  function renderHero(params, getAsset) {
    var hero = params.get('hero');
    if (!hero || !hero.get('display')) return null;
    var imgSrc = resolveImage(hero.get('heroImg'), getAsset);
    return h('section', { className: 'section_header-50-50' },
      h('div', { className: 'container' },
        h('div', { className: 'row d-flex flex-row' },
          h('div', { className: 'col-12 col-lg-5 pe-lg-4 d-flex flex-column justify-content-center align-items-center' },
            h('h1', { className: 'text-sector-mid' }, hero.get('heading') || ''),
            h('div', { className: 'p-large' }, hero.get('blurb') || '')
          ),
          h('div', { className: 'col-12 col-lg-7 mt-sm-5' },
            h('div', { className: 'img-wrapper pl10' },
              imgSrc ? h('img', { src: imgSrc, alt: '' }) : null
            )
          )
        )
      )
    );
  }
 
  // ── Locations grid ─────────────────────────────────────────────────────────
 
  function renderLocations(params, getAsset) {
    var loc = params.get('locations');
    if (!loc || !loc.get('display')) return null;
 
    var cards = [];
 
    // Map card — standalone object
    var map = loc.get('map');
    if (map && map.get('display')) {
      var mapThumb = resolveImage(map.get('Thumbnail'), getAsset);
      var mapPdf   = map.get('pdf') || '';
      cards.push(renderCard(map.get('Name'), mapThumb, mapPdf, getAsset));
    }
 
    // Location item cards
    var items = toArray(loc.get('items'));
    items.forEach(function(item, i) {
      if (!item.get('display')) return;
      var thumb = resolveImage(item.get('Thumbnail'), getAsset);
      var pdf   = item.get('pdf') || '';
      cards.push(renderCard(item.get('Name'), thumb, pdf, getAsset));
    });
 
    return h('div', { className: 'container downloads' },
      h('div', { className: 'row' }, cards)
    );
  }
 
  // ── Main preview component ─────────────────────────────────────────────────
 
  var LocationsPreview = createClass({
    render: function() {
      var entry    = this.props.entry;
      var getAsset = this.props.getAsset;
      var params   = entry.get('data');
      var sector   = params.get('sector') || 'locations';
 
      return h('main', { id: 'main', className: 'page_locations sector_' + sector },
        h('style', {}, locationStyles),
        renderHero(params, getAsset),
        renderLocations(params, getAsset)
      );
    }
  });
 
  CMS.registerPreviewTemplate("locations", LocationsPreview);


  var PostPreview = createClass({
    render: function() {
      var entry    = this.props.entry;
      var getAsset = this.props.getAsset;
 
      // Field values
      var title    = entry.getIn(['data', 'title'])    || '';
      var date     = entry.getIn(['data', 'date']);
      var intro    = entry.getIn(['data', 'intro']);
      var imageVal = entry.getIn(['data', 'image']);
      var tags     = entry.getIn(['data', 'tags']);
      var sources  = entry.getIn(['data', 'sources']);
      var sector   = (tags && tags.size > 0) ? tags.get(0).toLowerCase() : '';
 
      // Resolve image asset (handles local blob uploads)
      var imageSrc = imageVal ? getAsset(imageVal).toString() : null;
 
      // Format publish date
      var formattedDate = '';
      if (date) {
        try {
          formattedDate = new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
        } catch(e) { formattedDate = date; }
      }
 
      // Sources list
      var sourcesEl = null;
      if (sources && sources.size > 0) {
        sourcesEl = h('div', { className: 'sources' },
          h('ol', {},
            sources.map(function(src, i) {
              var url      = src.get('url');
              var urlTitle = src.get('urltitle') || url;
              var source   = src.get('source');
              var refno    = src.get('refno');
              return h('li', { key: i },
                refno  ? h('span', {}, refno + '. ') : null,
                source ? h('span', {}, source + (url ? ' — ' : '')) : null,
                url    ? h('a', { href: url, target: '_blank' }, urlTitle) : null
              );
            }).toArray()
          )
        );
      }
 
      return h('main', { id: 'main', className: 'sector_' + sector },
 
        // ── Article Header (mirrors section.section_article-header) ──────
        h('section', { className: 'section_article-header mb-5' },
          h('div', { className: 'container' },
            h('div', { className: 'row' },
              h('div', { className: 'col-12' },
 
                // Sector / tags label
                tags && tags.size > 0
                  ? h('p', { className: 'sector text-sector-mid' }, tags.join(', '))
                  : null,
 
                // Title
                h('h1', { className: 'text-sector-mid' }, title),
 
                // Publish date
                formattedDate
                  ? h('p', { className: 'article-date' }, formattedDate)
                  : null,
 
                // Hero image
                imageSrc
                  ? h('div', { className: 'img-wrapper' },
                      h('img', { src: imageSrc, alt: '' })
                    )
                  : null,
 
                // Intro blurb
                intro
                  ? h('p', { className: 'intro-blurb' }, intro)
                  : null
              )
            )
          )
        ),
 
        // ── Article Body (mirrors section.section_article-text) ──────────
        h('section', { className: 'section_article-text' },
          h('div', { className: 'container' },
            h('div', { className: 'row justify-content-center' },
              h('div', { className: 'col-12 col-lg-8' },
                h('div', { className: 'text-dark-blue mb-5 contentblock' },
                  this.props.widgetFor('body')
                ),
                sourcesEl
              )
            )
          )
        )
 
      );
    }
  });
 
  CMS.registerPreviewTemplate("articles", PostPreview);
  