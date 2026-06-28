( function () {
    var settings = window.wc && window.wc.wcSettings ? window.wc.wcSettings.getSetting( 'nowpayments_gateway_data', {} ) : {};
    var registry = window.wc && window.wc.wcBlocksRegistry ? window.wc.wcBlocksRegistry : null;
    var element = window.wp && window.wp.element ? window.wp.element : null;
    var decodeEntities = window.wp && window.wp.htmlEntities && window.wp.htmlEntities.decodeEntities ? window.wp.htmlEntities.decodeEntities : function( value ) { return value; };

    if ( ! registry || ! element || ! registry.registerPaymentMethod ) {
        return;
    }

    var createElement = element.createElement;
    var labelText = settings.title || 'NOWPayments';
    var descriptionText = settings.description || '';

    var Label = function() {
        var children = [ createElement( 'span', { key: 'text' }, decodeEntities( labelText ) ) ];

        if ( settings.icon ) {
            children.unshift(
                createElement( 'img', {
                    key: 'icon',
                    src: settings.icon,
                    alt: decodeEntities( labelText ),
                    style: { maxHeight: '24px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }
                } )
            );
        }

        return createElement( 'span', null, children );
    };

    var Content = function() {
        return createElement( 'div', null, decodeEntities( descriptionText ) );
    };

    registry.registerPaymentMethod( {
        name: 'nowpayments_gateway',
        label: createElement( Label, null ),
        ariaLabel: decodeEntities( labelText ),
        content: createElement( Content, null ),
        edit: createElement( Content, null ),
        canMakePayment: function() {
            return true;
        },
        supports: {
            features: settings.supports || [ 'products' ]
        }
    } );
}() );
