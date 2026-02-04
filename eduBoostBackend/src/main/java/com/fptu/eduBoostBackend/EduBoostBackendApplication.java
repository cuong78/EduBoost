package com.fptu.eduBoostBackend;

import com.fptu.eduBoostBackend.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EduBoostBackendApplication {

	public static void main(String[] args) {

		DotenvLoader.loadEnv();
		
		SpringApplication.run(EduBoostBackendApplication.class, args);
	}

}
