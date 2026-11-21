package com.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.InputStream;
import java.security.Key;
import java.security.KeyStore;
import java.security.PublicKey;
import java.security.cert.Certificate;

@Configuration
public class RsaConfig {

    @Value("${app.rsa.keystore}")
    private Resource keystoreResource;

    @Value("${app.rsa.keystore-password}")
    private String keystorePassword;

    @Value("${app.rsa.alias}")
    private String alias;

    @Value("${app.rsa.key-password}")
    private String keyPassword;

    @Bean
    public KeyStore keyStore() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        try (InputStream is = keystoreResource.getInputStream()) {
            keyStore.load(is, keystorePassword.toCharArray());
        }
        return keyStore;
    }

    @Bean
    public Key rsaPrivateKey(KeyStore keyStore) throws Exception {
        return keyStore.getKey(alias, keyPassword.toCharArray());
    }

    @Bean
    public PublicKey rsaPublicKey(KeyStore keyStore) throws Exception {
        Certificate cert = keyStore.getCertificate(alias);
        return cert.getPublicKey();
    }

}
