<?php
$this->form_fields = apply_filters(
    'wc_offline_form_fields',
    array(
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
            'description' => __( 'Please enter your Nowpayments.io IPN Secret.', 'wc-nowpayments-gateway' ),
            'default'     => '',
        ),
        'api_key' => array(
            'title'       => __( 'Api Key', 'wc-nowpayments-gateway' ),
            'type'        => 'password',
            'description' => __( 'Please enter your nowpayments.io Api Key.', 'wc-nowpayments-gateway' ),
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
            'description' => __( 'Please enter a prefix for your invoice numbers. If you use your nowpayments.io account for multiple stores ensure this prefix is unique. Changes will only affect new orders. If you modify this field, all current pending orders will not be able to update.', 'wc-nowpayments-gateway' ),
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
            'description' => __( '(this will Slow down website performance) Send copies of invalid IPNs to this email address.', 'wc-nowpayments-gateway' ),
        ),
        'debug_post_url' => array(
            'title'       => __( 'Debug post url', 'wc-nowpayments-gateway' ),
            'type'        => 'text',
            'default'     => '',
            'description' => __( '(this will Slow down website performance) Send post data to debug', 'wc-nowpayments-gateway' ),
        ),
        'debug' => array(
            'title'   => __( 'Debug logs', 'wc-nowpayments-gateway' ),
            'type'    => 'checkbox',
            'label'   => __( 'Enable debug logging', 'wc-nowpayments-gateway' ),
            'default' => 'yes',
        ),
    )
);
