<?php
/**
 * Plugin Name:             NOWPayments Gateway for WooCommerce
 * Plugin URI:              https://nowpayments.io/woocommerce-plugin
 * Description:             Cryptocurrency payment gateway for WooCommerce with HPOS and Checkout Blocks support.
 * Version:                 2.0.0
 * Author:                  NOWPayments
 * Author URI:              https://nowpayments.io/
 * License:                 proprietary
 * Text Domain:             wc-nowpayments-gateway
 * Domain Path:             /languages/
 * Requires at least:       6.2
 * Tested up to:            6.9.4
 * WC requires at least:    8.0.0
 * WC tested up to:         10.7
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! defined( 'NOWPAYMENTS_FOR_WOOCOMMERCE_PLUGIN_DIR' ) ) {
    define( 'NOWPAYMENTS_FOR_WOOCOMMERCE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'NOWPAYMENTS_FOR_WOOCOMMERCE_ASSET_URL' ) ) {
    define( 'NOWPAYMENTS_FOR_WOOCOMMERCE_ASSET_URL', plugin_dir_url( __FILE__ ) );
}

if ( ! defined( 'NOWPAYMENTS_FOR_WOOCOMMERCE_VERSION' ) ) {
    define( 'NOWPAYMENTS_FOR_WOOCOMMERCE_VERSION', '2.0.0' );
}

add_action(
    'before_woocommerce_init',
    static function() {
        if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true );
        }
    }
);

add_action(
    'plugins_loaded',
    static function() {
        load_plugin_textdomain( 'wc-nowpayments-gateway', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
    }
);

function wc_nowpayments_add_to_gateways( $gateways ) {
    if ( ! in_array( 'WC_Gateway_nowpayments', $gateways, true ) ) {
        $gateways[] = 'WC_Gateway_nowpayments';
    }

    return $gateways;
}
add_filter( 'woocommerce_payment_gateways', 'wc_nowpayments_add_to_gateways' );

function wc_nowpayments_gateway_plugin_links( $links ) {
    $plugin_links = array(
        '<a href="' . esc_url( admin_url( 'admin.php?page=wc-settings&tab=checkout&section=nowpayments_gateway' ) ) . '">' . esc_html__( 'Configure', 'wc-nowpayments-gateway' ) . '</a>',
    );

    return array_merge( $plugin_links, $links );
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'wc_nowpayments_gateway_plugin_links' );

add_action( 'woocommerce_api_wc_gateway_nowpayments', 'wc_nowpayments_handle_api_callback' );
function wc_nowpayments_handle_api_callback() {
    $gateway = null;

    if ( function_exists( 'WC' ) && WC() && WC()->payment_gateways() ) {
        $gateways = WC()->payment_gateways()->payment_gateways();
        if ( isset( $gateways['nowpayments_gateway'] ) && $gateways['nowpayments_gateway'] instanceof WC_Gateway_nowpayments ) {
            $gateway = $gateways['nowpayments_gateway'];
        }
    }

    if ( ! $gateway && class_exists( 'WC_Gateway_nowpayments' ) ) {
        $gateway = new WC_Gateway_nowpayments();
    }

    if ( $gateway instanceof WC_Gateway_nowpayments ) {
        $gateway->check_ipn_response();
    }

    status_header( 500 );
    echo esc_html__( 'NOWPayments gateway is unavailable.', 'wc-nowpayments-gateway' );
    exit;
}

add_action( 'plugins_loaded', 'wc_nowpayments_gateway_init', 11 );
function wc_nowpayments_gateway_init() {
    if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
        return;
    }

    class WC_Gateway_nowpayments extends WC_Payment_Gateway {
        /** @var string */
        protected $ipn_url = '';

        /** @var WC_Logger */
        protected $logger;

        /** @var string */
        protected $log_source = 'nowpayments-gateway';

        /** @var string */
        protected $ipn_secret = '';

        /** @var string */
        protected $api_key = '';

        /** @var string */
        public $instructions = '';

        /** @var bool */
        protected $auto_complete_order = false;

        /** @var string */
        protected $debug_email = '';

        /** @var string */
        protected $debug_post_url = '';

        /** @var bool */
        protected $simple_total = false;

        /** @var string */
        protected $invoice_prefix = 'WC-';

        /** @var string */
        protected $debug = 'yes';

        public function __construct() {
            $this->id                 = 'nowpayments_gateway';
            $this->icon               = apply_filters( 'woocommerce_nowpayments_icon', 'https://nowpayments.io/images/logo/nowpayments.png' );
            $this->has_fields         = false;
            $this->method_title       = __( 'NOWPayments', 'wc-nowpayments-gateway' );
            $this->method_description = __( 'Accept cryptocurrency payments through NOWPayments.', 'wc-nowpayments-gateway' );
            $this->supports           = array( 'products' );
            $this->logger             = wc_get_logger();
            $this->ipn_url            = $this->build_ipn_url();

            $this->init_form_fields();
            $this->init_settings();

            $this->title              = $this->get_option( 'title', __( 'NOWPayments', 'wc-nowpayments-gateway' ) );
            $this->description        = $this->get_option( 'description', __( 'Expand your payment options with NOWPayments! BTC, ETH, LTC and many more: pay with anything you like!', 'wc-nowpayments-gateway' ) );
            $this->instructions       = $this->get_option( 'instructions', '' );
            $this->ipn_secret         = (string) $this->get_option( 'ipn_secret', '' );
            $this->api_key            = (string) $this->get_option( 'api_key', '' );
            $this->debug_email        = sanitize_email( $this->get_option( 'debug_email', '' ) );
            $this->debug_post_url     = esc_url_raw( $this->get_option( 'debug_post_url', '' ) );
            $this->invoice_prefix     = (string) $this->get_option( 'invoice_prefix', 'WC-' );
            $this->simple_total       = 'yes' === $this->get_option( 'simple_total', 'no' );
            $this->auto_complete_order = 'yes' === $this->get_option( 'auto_complete_order', 'no' );
            $this->debug              = $this->get_option( 'debug', 'no' );

            add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
            add_action( 'woocommerce_thankyou_' . $this->id, array( $this, 'thankyou_page' ) );
            add_action( 'woocommerce_email_before_order_table', array( $this, 'email_instructions' ), 10, 3 );
        }

        protected function build_ipn_url() {

            if ( function_exists( 'WC' ) && WC() && is_callable( array( WC(), 'api_request_url' ) ) ) {
                return WC()->api_request_url( get_class( $this ) );
            }

            return add_query_arg( 'wc-api', get_class( $this ), home_url( '/' ) );
        }

        public function init_form_fields() {
            $this->form_fields = array();

            $fields_file = trailingslashit( NOWPAYMENTS_FOR_WOOCOMMERCE_PLUGIN_DIR ) . 'includes/setting_form_fields.php';

            if ( file_exists( $fields_file ) ) {
                include $fields_file;
            }

            if ( empty( $this->form_fields ) || ! is_array( $this->form_fields ) ) {
                $this->form_fields = $this->get_default_form_fields();
            }

            $this->form_fields = $this->normalize_form_fields( $this->form_fields );
        }

        protected function get_default_form_fields() {
            return array(
                'enabled' => array(
                    'title'   => __( 'Enable/Disable', 'wc-nowpayments-gateway' ),
                    'type'    => 'checkbox',
                    'label'   => __( 'Enable nowpayments.io', 'wc-nowpayments-gateway' ),
                    'default' => 'yes',
                ),
                'title' => array(
                    'title'       => __( 'Title', 'wc-nowpayments-gateway' ),
                    'type'        => 'text',
                    'description' => __( 'This controls the title which the user sees during checkout.', 'wc-nowpayments-gateway' ),
                    'default'     => __( 'NOWPayments', 'wc-nowpayments-gateway' ),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __( 'Description', 'wc-nowpayments-gateway' ),
                    'type'        => 'textarea',
                    'description' => __( 'This controls the description which the user sees during checkout.', 'wc-nowpayments-gateway' ),
                    'default'     => __( 'Expand your payment options with NOWPayments! BTC, ETH, LTC and many more: pay with anything you like!', 'wc-nowpayments-gateway' ),
                ),
                'instructions' => array(
                    'title'       => __( 'Instructions', 'wc-nowpayments-gateway' ),
                    'type'        => 'textarea',
                    'description' => '',
                    'default'     => '',
                    'desc_tip'    => true,
                ),
                'ipn_secret' => array(
                    'title'       => __( 'IPN Secret', 'wc-nowpayments-gateway' ),
                    'type'        => 'password',
                    'description' => __( 'Please enter your NOWPayments IPN Secret.', 'wc-nowpayments-gateway' ),
                    'default'     => '',
                ),
                'api_key' => array(
                    'title'       => __( 'Api Key', 'wc-nowpayments-gateway' ),
                    'type'        => 'password',
                    'description' => __( 'Please enter your NOWPayments Api Key.', 'wc-nowpayments-gateway' ),
                    'default'     => '',
                ),
                'simple_total' => array(
                    'title'   => __( 'Compatibility Mode', 'wc-nowpayments-gateway' ),
                    'type'    => 'checkbox',
                    'label'   => __( "This may be needed for compatibility with certain addons if the order total isn't correct.", 'wc-nowpayments-gateway' ),
                    'default' => '',
                ),
                'invoice_prefix' => array(
                    'title'       => __( 'Invoice Prefix', 'wc-nowpayments-gateway' ),
                    'type'        => 'text',
                    'description' => __( 'Please enter a prefix for your invoice numbers. If you use your NOWPayments account for multiple stores ensure this prefix is unique. Changes will only affect new orders. If you modify this field, all current pending orders will not be able to update.', 'wc-nowpayments-gateway' ),
                    'default'     => 'WC-',
                    'desc_tip'    => true,
                ),
                'auto_complete_order' => array(
                    'title'       => __( 'Auto-complete order', 'wc-nowpayments-gateway' ),
                    'label'       => __( 'Automatically mark paid orders as Completed', 'wc-nowpayments-gateway' ),
                    'type'        => 'checkbox',
                    'description' => __( 'If enabled, orders with successfully confirmed payments will be automatically set to Completed. If disabled, WooCommerce will use its default behavior and set the order to Processing or Completed depending on the order contents.', 'wc-nowpayments-gateway' ),
                    'default'     => 'yes',
                    'desc_tip'    => true,
                ),
                'debug_email' => array(
                    'title'       => __( 'Debug Email', 'wc-nowpayments-gateway' ),
                    'type'        => 'email',
                    'default'     => '',
                    'description' => __( '(this will slow down website performance) Send copies of invalid IPNs to this email address.', 'wc-nowpayments-gateway' ),
                ),
                'debug_post_url' => array(
                    'title'       => __( 'Debug post url', 'wc-nowpayments-gateway' ),
                    'type'        => 'text',
                    'default'     => '',
                    'description' => __( '(this will slow down website performance) Send post data to debug.', 'wc-nowpayments-gateway' ),
                ),
                'debug' => array(
                    'title'   => __( 'Debug logs', 'wc-nowpayments-gateway' ),
                    'type'    => 'checkbox',
                    'label'   => __( 'Enable debug logging', 'wc-nowpayments-gateway' ),
                    'default' => 'yes',
                ),
            );
        }

        protected function normalize_form_fields( array $fields ) {
            $fields = apply_filters( 'wc_nowpayments_form_fields', $fields, $this );

            return $fields;
        }

        public function validate_invoice_prefix_field( $key, $value = null ) {
            if ( null === $value ) {
                $value = $key;
                $key   = 'invoice_prefix';
            }

            $value = sanitize_text_field( (string) $value );

            if ( '' !== $value && preg_match( '/\d$/', $value ) ) {
                WC_Admin_Settings::add_error( esc_html__( 'Order prefix must not end with a digit.', 'wc-nowpayments-gateway' ) );
            }

            return $value;
        }

        public function admin_options() {
            echo '<h2>' . esc_html__( 'NOWPayments', 'wc-nowpayments-gateway' ) . '</h2>';
            echo '<p>' . esc_html__( 'Accept cryptocurrency payments through NOWPayments.', 'wc-nowpayments-gateway' ) . '</p>';
            echo '<table class="form-table">';
            $this->generate_settings_html();
            echo '</table>';
        }

        public function is_available() {
            if ( 'yes' !== $this->enabled ) {
                return false;
            }

            if ( empty( $this->api_key ) || empty( $this->ipn_secret ) ) {
                return false;
            }

            return parent::is_available();
        }

        public function thankyou_page() {
            if ( $this->instructions ) {
                echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) );
            }
        }

        public function email_instructions( $order, $sent_to_admin, $plain_text = false ) {
            if ( ! $order instanceof WC_Order ) {
                return;
            }

            if ( $this->instructions && ! $sent_to_admin && $this->id === $order->get_payment_method() && $order->has_status( array( 'pending', 'on-hold' ) ) ) {
                echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) ) . PHP_EOL;
            }
        }

        public function process_payment( $order_id ) {
            $order = wc_get_order( $order_id );

            if ( ! $order instanceof WC_Order ) {
                wc_add_notice( __( 'Unable to load the WooCommerce order for NOWPayments.', 'wc-nowpayments-gateway' ), 'error' );
                return array( 'result' => 'failure' );
            }

            if ( $order->is_paid() ) {
                return array(
                    'result'   => 'success',
                    'redirect' => $this->get_return_url( $order ),
                );
            }

            try {
                $redirect_url = $this->generate_invoice_url( $order );
            } catch ( Exception $exception ) {
                $this->log( 'process_payment error: ' . $exception->getMessage(), 'error' );
                wc_add_notice( __( 'NOWPayments is temporarily unavailable. Please choose a different payment method or try again later.', 'wc-nowpayments-gateway' ), 'error' );
                return array( 'result' => 'failure' );
            }

            $order->add_order_note( __( 'Customer was redirected to NOWPayments to complete the payment.', 'wc-nowpayments-gateway' ) );
            $order->update_meta_data( '_nowpayments_checkout_url', esc_url_raw( $redirect_url ) );
            $order->save();

            $this->debug_post_out(
                'checkout_redirect',
                array(
                    'order_id'     => $order->get_id(),
                    'redirect_url' => $redirect_url,
                    'mode'         => 'invoice',
                )
            );

            return array(
                'result'   => 'success',
                'redirect' => $redirect_url,
            );
        }

        protected function generate_invoice_url( WC_Order $order ) {
            $response = $this->post_json(
                'https://api.nowpayments.io/v1/invoice',
                $this->get_np_invoice_args( $order ),
                array(
                    'X-Api-Key' => $this->api_key,
                )
            );

            if ( empty( $response['invoice_url'] ) ) {
                throw new Exception( __( 'NOWPayments did not return an invoice URL.', 'wc-nowpayments-gateway' ) );
            }

            return esc_url_raw( $response['invoice_url'] );
        }

        protected function get_nowpayments_args( WC_Order $order ) {
            $customer_name = $order->get_formatted_billing_full_name();
            if ( '' === $customer_name ) {
                $customer_name = $order->get_billing_first_name();
            }

            $args = array(
                'dataSource'      => 'woocommerce',
                'ipnURL'          => $this->ipn_url,
                'paymentCurrency' => $order->get_currency(),
                'successURL'      => $this->get_return_url( $order ),
                'cancelURL'       => esc_url_raw( $order->get_cancel_order_url_raw() ),
                'orderID'         => $this->get_external_order_reference( $order ),
                'apiKey'          => $this->api_key,
                'customerName'    => $customer_name,
                'customerEmail'   => $order->get_billing_email(),
                'orderDescription'=> $this->get_order_description( $order ),
            );

            if ( $this->simple_total ) {
                $args['paymentAmount'] = $this->format_amount( $order->get_total() );
                $args['shipping']      = '0.00000000';
                $args['tax']           = '0.00000000';
            } elseif ( wc_tax_enabled() && wc_prices_include_tax() ) {
                $args['paymentAmount'] = $this->format_amount( $order->get_total() );
                $args['shipping']      = $this->format_amount( $order->get_shipping_total() + $order->get_shipping_tax() );
                $args['tax']           = '0.00000000';
            } else {
                $args['paymentAmount'] = $this->format_amount( $order->get_total() );
                $args['shipping']      = $this->format_amount( $order->get_shipping_total() );
                $args['tax']           = $this->format_amount( $order->get_total_tax() );
            }

            $products = array();
            foreach ( $order->get_items() as $item ) {
                if ( ! $item instanceof WC_Order_Item_Product ) {
                    continue;
                }

                $line_total = (float) $item->get_total() + (float) $item->get_total_tax();
                $quantity   = max( 1, (int) $item->get_quantity() );

                $products[] = array(
                    'name'     => $item->get_name(),
                    'quantity' => $quantity,
                    'price'    => $this->format_amount( $line_total / $quantity ),
                );
            }

            if ( ! empty( $products ) ) {
                $args['products'] = $products;
            }

            return apply_filters( 'woocommerce_nowpayments_args', $args, $order );
        }

        protected function get_np_invoice_args( WC_Order $order ) {
            $args = array(
                'source'           => $this->get_source_string(),
                'ipn_callback_url' => $this->ipn_url,
                'price_currency'   => $order->get_currency(),
                'price_amount'     => $this->format_amount( $order->get_total() ),
                'order_id'         => $this->get_external_order_reference( $order ),
                'order_description'=> $this->get_order_description( $order ),
                'success_url'      => $this->get_return_url( $order ),
                'cancel_url'       => esc_url_raw( $order->get_cancel_order_url_raw() ),
            );

            return apply_filters( 'woocommerce_nowpayments_invoice_args', $args, $order );
        }

        protected function get_source_string() {
            $php_version = phpversion();
            $wp_version  = get_bloginfo( 'version' );
            $wc_version  = function_exists( 'WC' ) && WC() ? WC()->version : 'unknown';

            return sprintf( 'woocommerce_php%s_wp%s_wc%s', $php_version, $wp_version, $wc_version );
        }

        protected function get_order_description( WC_Order $order ) {
            return sprintf(
                /* translators: 1: public order number, 2: site name */
                __( 'WooCommerce order %1$s on %2$s', 'wc-nowpayments-gateway' ),
                $order->get_order_number(),
                wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES )
            );
        }

        protected function get_external_order_reference( WC_Order $order ) {
            return (string) $this->invoice_prefix . $order->get_id();
        }

        protected function format_amount( $amount ) {
            return number_format( (float) $amount, 8, '.', '' );
        }

        protected function post_json( $url, array $payload, array $headers = array() ) {
            $headers = wp_parse_args(
                $headers,
                array(
                    'Content-Type' => 'application/json',
                )
            );

            $args = array(
                'timeout' => 45,
                'headers' => $headers,
                'body'    => wp_json_encode( $payload ),
            );

            $this->log(
                array(
                    'request_url'  => $url,
                    'request_body' => $payload,
                )
            );

            $response = wp_remote_post( $url, $args );

            if ( is_wp_error( $response ) ) {
                throw new Exception( $response->get_error_message() );
            }

            $status = (int) wp_remote_retrieve_response_code( $response );
            $body   = wp_remote_retrieve_body( $response );
            $json   = json_decode( $body, true );

            $this->log(
                array(
                    'response_status' => $status,
                    'response_body'   => $body,
                )
            );

            if ( $status < 200 || $status >= 300 ) {
                $message = is_array( $json ) && ! empty( $json['message'] ) ? (string) $json['message'] : $body;
                throw new Exception( sprintf( 'HTTP %1$d: %2$s', $status, $message ) );
            }

            if ( ! is_array( $json ) ) {
                throw new Exception( __( 'NOWPayments returned an invalid JSON response.', 'wc-nowpayments-gateway' ) );
            }

            return $json;
        }

        protected function get_np_ipn_signature() {
            if ( ! empty( $_SERVER['HTTP_X_NOWPAYMENTS_SIG'] ) ) {
                return trim( sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_NOWPAYMENTS_SIG'] ) ) );
            }

            if ( function_exists( 'getallheaders' ) ) {
                $headers = getallheaders();
                if ( is_array( $headers ) ) {
                    foreach ( $headers as $key => $value ) {
                        if ( 'X-NOWPAYMENTS-SIG' === strtoupper( $key ) ) {
                            return trim( (string) $value );
                        }
                    }
                }
            }

            return false;
        }

        protected function recursive_ksort( &$data ) {
            if ( ! is_array( $data ) ) {
                return;
            }

            ksort( $data );

            foreach ( $data as &$value ) {
                if ( is_array( $value ) ) {
                    $this->recursive_ksort( $value );
                }
            }
        }

        protected function build_sorted_signature_body( array $payload ) {
            $sorted = $payload;
            $this->recursive_ksort( $sorted );

            return wp_json_encode( $sorted, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
        }

        protected function lookup_order( $external_order_reference ) {
            $reference = trim( (string) $external_order_reference );
            if ( '' === $reference ) {
                return false;
            }

            $order_id = 0;

            if ( '' !== $this->invoice_prefix && 0 === strpos( $reference, $this->invoice_prefix ) ) {
                $reference = substr( $reference, strlen( $this->invoice_prefix ) );
            }

            if ( ctype_digit( $reference ) ) {
                $order_id = absint( $reference );
            }

            if ( ! $order_id && preg_match( '/(\d+)$/', $reference, $matches ) ) {
                $order_id = absint( $matches[1] );
            }

            if ( ! $order_id ) {
                return false;
            }

            $order = wc_get_order( $order_id );
            return $order instanceof WC_Order ? $order : false;
        }

        protected function validate_ipn_payload( $raw_body ) {
            $signature = $this->get_np_ipn_signature();
            if ( ! $signature ) {
                return array(
                    'valid' => false,
                    'code'  => 400,
                    'error' => 'Missing x-nowpayments-sig header.',
                );
            }

            if ( empty( $this->ipn_secret ) ) {
                return array(
                    'valid' => false,
                    'code'  => 500,
                    'error' => 'NOWPayments IPN secret is not configured.',
                );
            }

            $payload = json_decode( $raw_body, true );
            if ( ! is_array( $payload ) ) {
                return array(
                    'valid' => false,
                    'code'  => 400,
                    'error' => 'Invalid JSON body.',
                );
            }

            $sorted_body      = $this->build_sorted_signature_body( $payload );
            $calculated_hmac  = hash_hmac( 'sha512', (string) $sorted_body, trim( $this->ipn_secret ) );
            $raw_body_hmac    = hash_hmac( 'sha512', (string) $raw_body, trim( $this->ipn_secret ) );
            $signature_valid  = hash_equals( $calculated_hmac, $signature ) || hash_equals( $raw_body_hmac, $signature );

            if ( ! $signature_valid ) {
                return array(
                    'valid'   => false,
                    'code'    => 403,
                    'error'   => 'Invalid NOWPayments signature.',
                    'payload' => $payload,
                );
            }

            $external_order_reference = '';
            if ( ! empty( $payload['order_id'] ) ) {
                $external_order_reference = (string) $payload['order_id'];
            } elseif ( ! empty( $payload['orderID'] ) ) {
                $external_order_reference = (string) $payload['orderID'];
            }

            $order = $this->lookup_order( $external_order_reference );
            if ( ! $order ) {
                return array(
                    'valid'   => false,
                    'code'    => 404,
                    'error'   => 'Matching WooCommerce order not found.',
                    'payload' => $payload,
                );
            }

            $price_currency = ! empty( $payload['price_currency'] ) ? strtoupper( (string) $payload['price_currency'] ) : '';
            if ( $price_currency && strtoupper( $order->get_currency() ) !== $price_currency ) {
                return array(
                    'valid'   => false,
                    'code'    => 400,
                    'error'   => 'Order currency does not match NOWPayments payload.',
                    'order'   => $order,
                    'payload' => $payload,
                );
            }

            if ( isset( $payload['price_amount'] ) ) {
                $payload_amount = (float) $payload['price_amount'];
                $order_total    = (float) $order->get_total();

                if ( abs( $payload_amount - $order_total ) > 0.0001 ) {
                    return array(
                        'valid'   => false,
                        'code'    => 400,
                        'error'   => 'Order total does not match NOWPayments payload.',
                        'order'   => $order,
                        'payload' => $payload,
                    );
                }
            }

            return array(
                'valid'   => true,
                'code'    => 200,
                'order'   => $order,
                'payload' => $payload,
            );
        }

        protected function get_payload_payment_id( array $payload ) {
            if ( ! empty( $payload['payment_id'] ) ) {
                return sanitize_text_field( (string) $payload['payment_id'] );
            }

            if ( ! empty( $payload['purchase_id'] ) ) {
                return sanitize_text_field( (string) $payload['purchase_id'] );
            }

            return '';
        }

        protected function normalize_status( $status ) {
            return strtolower( preg_replace( '/[^a-z_]/', '', (string) $status ) );
        }

        protected function mark_order_paid( WC_Order $order, array $payload, $note ) {
            $payment_id = $this->get_payload_payment_id( $payload );

            if ( ! $payment_id ) {
                $message = __( 'NOWPayments IPN did not contain payment_id. Order was not marked as paid.', 'wc-nowpayments-gateway' );

                $order->add_order_note( $message );
                $this->log( $message, 'error', array(
                    'order_id' => $order->get_id(),
                    'payload'  => $payload,
                ) );

                return false;
            }

            if ( ! $order->is_paid() ) {
                $order->payment_complete( $payment_id );

                if ( $this->auto_complete_order ) {
                    $order->update_status( 'completed', __( 'Auto-complete paid order.', 'wc-nowpayments-gateway' ) );
                }
            }

            $order->add_order_note( $note );
            $order->save();

            return true;
        }

        protected function handle_ipn_status( WC_Order $order, array $payload ) {
            $status          = $this->normalize_status( isset( $payload['payment_status'] ) ? $payload['payment_status'] : '' );
            $payment_id      = $this->get_payload_payment_id( $payload );
            $previous_status = (string) $order->get_meta( '_nowpayments_last_status', true );
            $previous_pid    = (string) $order->get_meta( '_nowpayments_payment_id', true );
            $actually_paid   = isset( $payload['actually_paid'] ) ? (string) $payload['actually_paid'] : '';
            $pay_currency    = isset( $payload['pay_currency'] ) ? (string) $payload['pay_currency'] : '';

            if (! $payment_id) {
              $message = 'NOWPayments IPN did not contain payment_id.';
              $this->log($message);
              $order->add_order_note( __( $message, 'wc-nowpayments-gateway' ) );
            }

            if ($previous_pid && $payment_id !== $previous_pid) {
              $order->add_order_note( sprintf(__( 'NOWPayments received related payment with id %1$s. Check NOWPayment interface.', 'wc-nowpayments-gateway' ), $payment_id) );
              return;
            }

            if ( $status === $previous_status) {
                $message = 'Duplicate NOWPayments IPN ignored for order ' . $order->get_id() . ' and status ' . $status;
                $this->log($message);
                $order->add_order_note( __( $message, 'wc-nowpayments-gateway' ) );
                return;
            }

            $order->update_meta_data( '_nowpayments_payment_id', $payment_id );

            if ( ! $order->get_transaction_id() ) {
                $order->set_transaction_id( $payment_id );
            }

            switch ( $status ) {
                case 'finished':
                    $this->mark_order_paid( $order, $payload, __( 'NOWPayments payment finished.', 'wc-nowpayments-gateway' ) );
                    break;

                case 'waiting':
                  if ( ! $previous_pid && ! $order->has_status( array( 'processing', 'completed', 'on-hold', 'cancelled', 'refunded' ) ) ) {
                    $order->add_order_note( __( 'NOWPayments payment created and awaiting deposit.', 'wc-nowpayments-gateway' ) );
                  }

                  break;
                case 'confirming':
                case 'confirmed':
                case 'sending':
                    if ( ! $order->has_status( array( 'processing','completed', 'cancelled', 'refunded' ) ) ) {
                        $order->update_status( 'on-hold', sprintf( __( 'NOWPayments status: %s.', 'wc-nowpayments-gateway' ), $status ) );
                    }
                    $order->add_order_note( sprintf( __( 'NOWPayments status updated to %s.', 'wc-nowpayments-gateway' ), $status ) );
                    break;

                case 'partially_paid':
                    if ( ! $order->has_status( array( 'processing', 'completed', 'cancelled', 'refunded' ) ) ) {
                        $order->update_status( 'on-hold', __( 'NOWPayments reports a partial payment.', 'wc-nowpayments-gateway' ) );
                    }
                    $order->add_order_note(
                        sprintf(
                            __( 'NOWPayments reports a partial payment. Received: %1$s %2$s.', 'wc-nowpayments-gateway' ),
                            $actually_paid,
                            $pay_currency
                        )
                    );
                    break;

                case 'failed':
                    if ( ! $order->has_status( array( 'processing', 'completed', 'cancelled', 'refunded', 'failed' ) ) ) {
                        $order->update_status( 'on-hold', __( 'NOWPayments reports a failed payment.', 'wc-nowpayments-gateway' ) );
                    }
                    $order->add_order_note(
                        sprintf(__( 'NOWPayments reports a failed payment.', 'wc-nowpayments-gateway' ),)
                    );
                    break;
                case 'expired':
                    if (! $order->has_status( array( 'processing', 'completed', 'on-hold', 'cancelled', 'refunded', 'failed' ) )) {
                        $order->add_order_note( sprintf( __( 'NOWPayments status updated to %s.', 'wc-nowpayments-gateway' ), $status ) );
                    }

                    break;

                case 'refunded':
                    if ( ! $order->has_status( array( 'processing', 'completed', 'cancelled', 'refunded' ) ) ) {
                        $order->update_status( 'refunded', __( 'NOWPayments payment refunded.', 'wc-nowpayments-gateway' ) );
                        $order->add_order_note( __( 'NOWPayments payment refunded before the order was marked as paid.', 'wc-nowpayments-gateway' ) );
                    }

                    break;

                default:
                    $order->add_order_note( sprintf( __( 'Unhandled NOWPayments status received: %s.', 'wc-nowpayments-gateway' ), $status ? $status : 'unknown' ) );
                    break;
            }

            $order->update_meta_data( '_nowpayments_last_status', $status );
            $order->save();
        }

        public function check_ipn_response() {
            if ( ! defined( 'DOING_AJAX' ) ) {
                @ob_clean();
            }

            $raw_body   = file_get_contents( 'php://input' );
            $validation = $this->validate_ipn_payload( (string) $raw_body );

            $this->debug_post_out(
                'ipn_request',
                array(
                    'raw_body'    => $raw_body,
                    'validation'  => $validation,
                )
            );

            if ( empty( $validation['valid'] ) ) {
                $error   = isset( $validation['error'] ) ? (string) $validation['error'] : 'Invalid NOWPayments IPN.';
                $payload = isset( $validation['payload'] ) && is_array( $validation['payload'] ) ? $validation['payload'] : array();
                $order   = isset( $validation['order'] ) && $validation['order'] instanceof WC_Order ? $validation['order'] : null;

                $this->log( 'Invalid IPN: ' . $error, 'warning' );

                if ( $order ) {
                    $order->add_order_note( sprintf( __( 'Invalid NOWPayments callback ignored: %s', 'wc-nowpayments-gateway' ), $error ) );
                    $order->save();
                }

                if ( ! empty( $this->debug_email ) ) {
                    $subject = __( 'NOWPayments invalid IPN', 'wc-nowpayments-gateway' );
                    $message = $error . "\n\n" . print_r( $payload, true );
                    wp_mail( $this->debug_email, $subject, $message );
                }

                status_header( isset( $validation['code'] ) ? (int) $validation['code'] : 400 );
                echo esc_html( $error );
                exit;
            }

            /** @var WC_Order $order */
            $order   = $validation['order'];
            $payload = $validation['payload'];

            $this->handle_ipn_status( $order, $payload );

            status_header( 200 );
            echo 'OK';
            exit;
        }

        protected function log( $message, $level = 'info' ) {
            if ( 'yes' !== $this->debug ) {
                return;
            }

            if ( is_array( $message ) || is_object( $message ) ) {
                $message = wc_print_r( $message, true );
            }

            $this->logger->log( $level, (string) $message, array( 'source' => $this->log_source ) );
        }

        protected function debug_post_out( $key, $value ) {
            if ( empty( $this->debug_post_url ) ) {
                return;
            }

            $body = wp_json_encode(
                array(
                    'key'   => $key,
                    'value' => $value,
                )
            );

            wp_remote_post(
                $this->debug_post_url,
                array(
                    'timeout'  => 5,
                    'blocking' => false,
                    'headers'  => array(
                        'Content-Type' => 'application/json',
                    ),
                    'body'     => $body,
                )
            );
        }
    }
}


add_action( 'woocommerce_blocks_loaded', 'wc_nowpayments_register_blocks_support' );
function wc_nowpayments_register_blocks_support() {
    if ( ! class_exists( \Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType::class ) ) {
        return;
    }

    if ( ! class_exists( 'WC_NowPayments_Blocks_Support' ) ) {
        class WC_NowPayments_Blocks_Support extends \Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType {
            protected $name = 'nowpayments_gateway';

            protected $settings = array();

            public function initialize() {
                $this->settings = get_option( 'woocommerce_nowpayments_gateway_settings', array() );
            }

            public function is_active() {
                return ! empty( $this->settings['enabled'] )
                    && 'yes' === $this->settings['enabled']
                    && ! empty( $this->settings['api_key'] )
                    && ! empty( $this->settings['ipn_secret'] );
            }

            public function get_payment_method_script_handles() {
                $handle = 'wc-nowpayments-blocks';
                $dependencies = array( 'wc-blocks-registry', 'wc-settings', 'wp-element', 'wp-html-entities', 'wp-i18n' );

                if ( ! wp_script_is( $handle, 'registered' ) ) {
                    wp_register_script( $handle, false, $dependencies, NOWPAYMENTS_FOR_WOOCOMMERCE_VERSION, true );
                    wp_add_inline_script( $handle, $this->get_inline_payment_method_script() );
                }

                return array( $handle );
            }

            public function get_payment_method_script_handles_for_admin() {
                return $this->get_payment_method_script_handles();
            }

            public function get_payment_method_data() {
                $title       = isset( $this->settings['title'] ) ? (string) $this->settings['title'] : __( 'NOWPayments', 'wc-nowpayments-gateway' );
                $description = isset( $this->settings['description'] ) ? (string) $this->settings['description'] : __( 'Expand your payment options with NOWPayments! BTC, ETH, LTC and many more: pay with anything you like!', 'wc-nowpayments-gateway' );
                $icon        = apply_filters( 'woocommerce_nowpayments_icon', 'https://nowpayments.io/images/logo/nowpayments.png' );
                $supports    = array( 'products' );

                if ( function_exists( 'WC' ) && WC() && WC()->payment_gateways() ) {
                    $gateways = WC()->payment_gateways()->payment_gateways();
                    if ( isset( $gateways['nowpayments_gateway'] ) && isset( $gateways['nowpayments_gateway']->supports ) && is_array( $gateways['nowpayments_gateway']->supports ) ) {
                        $supports = array_values( $gateways['nowpayments_gateway']->supports );
                    }
                }

                return array(
                    'title'           => $title,
                    'description'     => $description,
                    'icon'            => $icon,
                    'supports'        => $supports,
                    'gatewayId'       => 'nowpayments_gateway',
                    'paymentMethodId' => 'nowpayments_gateway',
                );
            }

            protected function get_inline_payment_method_script() {
                return <<<'JS'
( function () {
    var wc = window.wc || {};
    var registry = wc.wcBlocksRegistry || null;
    var settingsApi = wc.wcSettings || null;
    var wpElement = window.wp && window.wp.element ? window.wp.element : null;
    var htmlEntities = window.wp && window.wp.htmlEntities ? window.wp.htmlEntities : null;

    if ( ! registry || ! registry.registerPaymentMethod || ! settingsApi || ! settingsApi.getSetting || ! wpElement ) {
        return;
    }

    var settings = settingsApi.getSetting( 'nowpayments_gateway_data', {} );
    var createElement = wpElement.createElement;
    var decodeEntities = htmlEntities && htmlEntities.decodeEntities ? htmlEntities.decodeEntities : function( value ) {
        return value;
    };

    var labelText = settings.title || 'NOWPayments';
    var descriptionText = settings.description || '';
    var iconUrl = settings.icon || '';
    var supportedFeatures = Array.isArray( settings.supports ) ? settings.supports : [ 'products' ];
    var gatewayId = settings.gatewayId || 'nowpayments_gateway';
    var paymentMethodId = settings.paymentMethodId || gatewayId;

    var Label = function( props ) {
        var PaymentMethodLabel = props && props.components ? props.components.PaymentMethodLabel : null;

        if ( PaymentMethodLabel ) {
            var icons = [];

            if ( iconUrl ) {
                icons.push( {
                    id: 'nowpayments',
                    src: iconUrl,
                    alt: decodeEntities( labelText ),
                } );
            }

            return createElement( PaymentMethodLabel, {
                text: decodeEntities( labelText ),
                icons: icons,
            } );
        }

        var children = [];

        if ( iconUrl ) {
            children.push(
                createElement( 'img', {
                    key: 'icon',
                    src: iconUrl,
                    alt: decodeEntities( labelText ),
                    style: {
                        maxHeight: '24px',
                        marginRight: '8px',
                        display: 'inline-block',
                        verticalAlign: 'middle'
                    }
                } )
            );
        }

        children.push( createElement( 'span', { key: 'text' }, decodeEntities( labelText ) ) );

        return createElement( 'span', null, children );
    };

    var Content = function() {
        return createElement( 'div', null, decodeEntities( descriptionText ) );
    };

    registry.registerPaymentMethod( {
        name: gatewayId,
        paymentMethodId: paymentMethodId,
        gatewayId: gatewayId,
        label: createElement( Label, null ),
        ariaLabel: decodeEntities( labelText ),
        content: createElement( Content, null ),
        edit: createElement( Content, null ),
        canMakePayment: function() {
            return true;
        },
        supports: {
            features: supportedFeatures,
        },
    } );
}() );
JS;
            }
        }
    }

    add_action(
        'woocommerce_blocks_payment_method_type_registration',
        static function( \Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry ) {
            $payment_method_registry->register( new WC_NowPayments_Blocks_Support() );
        }
    );
}
