package com.fptu.eduBoostBackend.service.impl;

import com.fptu.eduBoostBackend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.UUID;

@Service
@Primary
@RequiredArgsConstructor
@Slf4j
public class MinioFileStorageServiceImpl implements FileStorageService {

    private final S3Client s3Client;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @PostConstruct
    public void init() {
        createBucketIfNotExists();
    }

    private void createBucketIfNotExists() {
        try {
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            s3Client.headBucket(headBucketRequest);
            log.info("MinIO bucket already exists: {}", bucketName);
        } catch (NoSuchBucketException e) {
            log.info("Creating MinIO bucket: {}", bucketName);
            CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            s3Client.createBucket(createBucketRequest);
            log.info("MinIO bucket created successfully: {}", bucketName);
        } catch (S3Exception e) {
            log.error("Error checking/creating bucket: {}", e.getMessage(), e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = originalFilename.contains(".") ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            
            // Generate unique filename with folder structure
            String folder = determineFolder(file.getContentType());
            String objectKey = folder + "/" + UUID.randomUUID() + extension;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded to MinIO successfully: {}", objectKey);
            return objectKey;

        } catch (IOException e) {
            log.error("Failed to store file in MinIO", e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public Resource loadFileAsResource(String objectKey) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            // Get the S3 object response with metadata
            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest);
            
            // Read all bytes from the input stream
            byte[] content = s3Object.readAllBytes();
            s3Object.close();
            
            // Extract filename from objectKey (remove folder path)
            String filename = objectKey.contains("/") ? 
                    objectKey.substring(objectKey.lastIndexOf("/") + 1) : objectKey;
            
            // Create ByteArrayResource with custom filename
            return new ByteArrayResource(content) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

        } catch (S3Exception e) {
            log.error("Failed to load file from MinIO: {}", objectKey, e);
            throw new RuntimeException("File not found: " + objectKey, e);
        } catch (IOException e) {
            log.error("Failed to read file content from MinIO: {}", objectKey, e);
            throw new RuntimeException("Failed to read file content: " + objectKey, e);
        }
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted from MinIO successfully: {}", fileName);

        } catch (S3Exception e) {
            log.error("Failed to delete file from MinIO: {}", fileName, e);
        }
    }

    @Override
    public long getFileSize(String objectKey) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            
            HeadObjectResponse response = s3Client.headObject(headObjectRequest);
            return response.contentLength();
            
        } catch (S3Exception e) {
            log.error("Failed to get file size from MinIO: {}", objectKey, e);
            throw new RuntimeException("Failed to get file size: " + objectKey, e);
        }
    }

    private String determineFolder(String contentType) {
        if (contentType == null) return "others";
        
        if (contentType.contains("pdf")) return "documents/pdf";
        if (contentType.contains("word") || contentType.contains("document")) 
            return "documents/docx";
        if (contentType.contains("image")) return "images";
        if (contentType.contains("video")) return "videos";
        
        return "others";
    }
}
