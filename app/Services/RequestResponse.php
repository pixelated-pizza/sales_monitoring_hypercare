<?php

namespace App\Services;
use Symfony\Component\HttpFoundation\Response;

class RequestResponse
{
    private static $message;
    private static $data;
    private static $response;
    private static $errors;

    public static function setMessage(string $message){
        self::$message = $message;
        return new static();
    }

    public static function setData(array $data){
        self::$data = $data;
        return new static();
    }

    public static function setErrors(array $errors) {
        self::$errors = $errors;
        return new static();
    }

    private static function setResponse() {
        self::$response = [];
        if (isset(self::$message) && !empty(self::$message)) {
            self::$response['message'] = self::$message;
        }
        if (isset(self::$data) && !empty(self::$data)) {
            self::$response['data'] = self::$data;
        }
        if (isset(self::$errors) && !empty(self::$errors)) {
            self::$response['errors'] = self::$errors;
        }
    }

    public static function success() {
        self::setResponse();
        return response()->json(self::$response,Response::HTTP_OK);
    }

    public static function clientError() {
        self::setResponse();
        return response()->json(self::$response,Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public static function unauthorized() {
        self::setResponse();
        return response()->json(self::$response,Response::HTTP_UNAUTHORIZED);
    }

    public static function serverError() {
        self::setResponse();
        return response()->json(self::$response,Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    public static function notFound() {
        self::setResponse();
        return response()->json(self::$response,Response::HTTP_NOT_FOUND);
    }

    public static function conflict() {
        self::setResponse();
        return response()->json(self::$response,Response::HTTP_CONFLICT);
    }

    public static function showFile($file, $content_type = null) {
        self::setResponse();
        $headers = [];
        if ($content_type) {
            $headers['Content-Type'] = $content_type;
        }
        return response()->file($file, $headers);
    }
}