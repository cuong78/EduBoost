package com.fptu.eduBoostBackend;

import com.fptu.eduBoostBackend.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableScheduling
@EnableCaching
@EnableAsync
public class EduBoostBackendApplication {

	@PostConstruct
	void setTimezone() {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
	}

	public static void main(String[] args) {

		DotenvLoader.loadEnv();
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		
		SpringApplication.run(EduBoostBackendApplication.class, args);
	}

}
