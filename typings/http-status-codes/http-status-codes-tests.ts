/// <reference path="http-status-codes.d.ts"/>

import HttpStatusCodes = require("http-status-codes");

var ACCEPTED = HttpStatusCodes.ACCEPTED;
var BAD_GATEWAY = HttpStatusCodes.BAD_GATEWAY;
var BAD_REQUEST = HttpStatusCodes.BAD_REQUEST;
var CONFLICT = HttpStatusCodes.CONFLICT;
var CONTINUE = HttpStatusCodes.CONTINUE;
var CREATED = HttpStatusCodes.CREATED;
var EXPECTATION_FAILED = HttpStatusCodes.EXPECTATION_FAILED;
var FAILED_DEPENDENCY = HttpStatusCodes.FAILED_DEPENDENCY;
var FORBIDDEN = HttpStatusCodes.FORBIDDEN;
var GATEWAY_TIMEOUT = HttpStatusCodes.GATEWAY_TIMEOUT;
var GONE = HttpStatusCodes.GONE;
var HTTP_VERSION_NOT_SUPPORTED = HttpStatusCodes.HTTP_VERSION_NOT_SUPPORTED;
var INSUFFICIENT_SPACE_ON_RESOURCE = HttpStatusCodes.INSUFFICIENT_SPACE_ON_RESOURCE;
var INSUFFICIENT_STORAGE = HttpStatusCodes.INSUFFICIENT_STORAGE;
var INTERNAL_SERVER_ERROR = HttpStatusCodes.INTERNAL_SERVER_ERROR;
var LENGTH_REQUIRED = HttpStatusCodes.LENGTH_REQUIRED;
var LOCKED = HttpStatusCodes.LOCKED;
var METHOD_FAILURE = HttpStatusCodes.METHOD_FAILURE;
var METHOD_NOT_ALLOWED = HttpStatusCodes.METHOD_NOT_ALLOWED;
var MOVED_PERMANENTLY = HttpStatusCodes.MOVED_PERMANENTLY;
var MOVED_TEMPORARILY = HttpStatusCodes.MOVED_TEMPORARILY;
var MULTI_STATUS = HttpStatusCodes.MULTI_STATUS;
var MULTIPLE_CHOICES = HttpStatusCodes.MULTIPLE_CHOICES;
var NETWORK_AUTHENTICATION_REQUIRED = HttpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED;
var NO_CONTENT = HttpStatusCodes.NO_CONTENT;
var NON_AUTHORITATIVE_INFORMATION = HttpStatusCodes.NON_AUTHORITATIVE_INFORMATION;
var NOT_ACCEPTABLE = HttpStatusCodes.NOT_ACCEPTABLE;
var NOT_FOUND = HttpStatusCodes.NOT_FOUND;
var NOT_IMPLEMENTED = HttpStatusCodes.NOT_IMPLEMENTED;
var NOT_MODIFIED = HttpStatusCodes.NOT_MODIFIED;
var OK = HttpStatusCodes.OK;
var PARTIAL_CONTENT = HttpStatusCodes.PARTIAL_CONTENT;
var PAYMENT_REQUIRED = HttpStatusCodes.PAYMENT_REQUIRED;
var PRECONDITION_FAILED = HttpStatusCodes.PRECONDITION_FAILED;
var PRECONDITION_REQUIRED = HttpStatusCodes.PRECONDITION_REQUIRED;
var PROCESSING = HttpStatusCodes.PROCESSING;
var PROXY_AUTHENTICATION_REQUIRED = HttpStatusCodes.PROXY_AUTHENTICATION_REQUIRED;
var REQUEST_HEADER_FIELDS_TOO_LARGE = HttpStatusCodes.REQUEST_HEADER_FIELDS_TOO_LARGE;
var REQUEST_TIMEOUT = HttpStatusCodes.REQUEST_TIMEOUT;
var REQUEST_TOO_LONG = HttpStatusCodes.REQUEST_TOO_LONG;
var REQUEST_URI_TOO_LONG = HttpStatusCodes.REQUEST_URI_TOO_LONG;
var REQUESTED_RANGE_NOT_SATISFIABLE = HttpStatusCodes.REQUESTED_RANGE_NOT_SATISFIABLE;
var RESET_CONTENT = HttpStatusCodes.RESET_CONTENT;
var SEE_OTHER = HttpStatusCodes.SEE_OTHER;
var SERVICE_UNAVAILABLE = HttpStatusCodes.SERVICE_UNAVAILABLE;
var SWITCHING_PROTOCOLS = HttpStatusCodes.SWITCHING_PROTOCOLS;
var TEMPORARY_REDIRECT = HttpStatusCodes.TEMPORARY_REDIRECT;
var TOO_MANY_REQUESTS = HttpStatusCodes.TOO_MANY_REQUESTS;
var UNAUTHORIZED = HttpStatusCodes.UNAUTHORIZED;
var UNPROCESSABLE_ENTITY = HttpStatusCodes.UNPROCESSABLE_ENTITY;
var UNSUPPORTED_MEDIA_TYPE = HttpStatusCodes.UNSUPPORTED_MEDIA_TYPE;
var USE_PROXY = HttpStatusCodes.USE_PROXY;

var ACCEPTED_Text = HttpStatusCodes.getStatusText(202);
var BAD_GATEWAY_Text = HttpStatusCodes.getStatusText(502);
var BAD_REQUEST_Text = HttpStatusCodes.getStatusText(400);
var CONFLICT_Text = HttpStatusCodes.getStatusText(409);
var CONTINUE_Text = HttpStatusCodes.getStatusText(100);
var CREATED_Text = HttpStatusCodes.getStatusText(201);
var EXPECTATION_FAILED_Text = HttpStatusCodes.getStatusText(417);
var FAILED_DEPENDENCY_Text = HttpStatusCodes.getStatusText(424);
var FORBIDDEN_Text = HttpStatusCodes.getStatusText(403);
var GATEWAY_TIMEOUT_Text = HttpStatusCodes.getStatusText(504);
var GONE_Text = HttpStatusCodes.getStatusText(410);
var HTTP_VERSION_NOT_SUPPORTED_Text = HttpStatusCodes.getStatusText(505);
var INSUFFICIENT_SPACE_ON_RESOURCE_Text = HttpStatusCodes.getStatusText(419);
var INSUFFICIENT_STORAGE_Text = HttpStatusCodes.getStatusText(507);
var INTERNAL_SERVER_ERROR_Text = HttpStatusCodes.getStatusText(500);
var LENGTH_REQUIRED_Text = HttpStatusCodes.getStatusText(411);
var LOCKED_Text = HttpStatusCodes.getStatusText(423);
var METHOD_FAILURE_Text = HttpStatusCodes.getStatusText(420);
var METHOD_NOT_ALLOWED_Text = HttpStatusCodes.getStatusText(405);
var MOVED_PERMANENTLY_Text = HttpStatusCodes.getStatusText(301);
var MOVED_TEMPORARILY_Text = HttpStatusCodes.getStatusText(302);
var MULTI_STATUS_Text = HttpStatusCodes.getStatusText(207);
var MULTIPLE_CHOICES_Text = HttpStatusCodes.getStatusText(300);
var NETWORK_AUTHENTICATION_REQUIRED_Text = HttpStatusCodes.getStatusText(511);
var NO_CONTENT_Text = HttpStatusCodes.getStatusText(204);
var NON_AUTHORITATIVE_INFORMATION_Text = HttpStatusCodes.getStatusText(203);
var NOT_ACCEPTABLE_Text = HttpStatusCodes.getStatusText(406);
var NOT_FOUND_Text = HttpStatusCodes.getStatusText(404);
var NOT_IMPLEMENTED_Text = HttpStatusCodes.getStatusText(501);
var NOT_MODIFIED_Text = HttpStatusCodes.getStatusText(304);
var OK_Text = HttpStatusCodes.getStatusText(200);
var PARTIAL_CONTENT_Text = HttpStatusCodes.getStatusText(206);
var PAYMENT_REQUIRED_Text = HttpStatusCodes.getStatusText(402);
var PRECONDITION_FAILED_Text = HttpStatusCodes.getStatusText(412);
var PRECONDITION_REQUIRED_Text = HttpStatusCodes.getStatusText(428);
var PROCESSING_Text = HttpStatusCodes.getStatusText(102);
var PROXY_AUTHENTICATION_REQUIRED_Text = HttpStatusCodes.getStatusText(407);
var REQUEST_HEADER_FIELDS_TOO_LARGE_Text = HttpStatusCodes.getStatusText(431);
var REQUEST_TIMEOUT_Text = HttpStatusCodes.getStatusText(408);
var REQUEST_TOO_LONG_Text = HttpStatusCodes.getStatusText(413);
var REQUEST_URI_TOO_LONG_Text = HttpStatusCodes.getStatusText(414);
var REQUESTED_RANGE_NOT_SATISFIABLE_Text = HttpStatusCodes.getStatusText(416);
var RESET_CONTENT_Text = HttpStatusCodes.getStatusText(205);
var SEE_OTHER_Text = HttpStatusCodes.getStatusText(303);
var SERVICE_UNAVAILABLE_Text = HttpStatusCodes.getStatusText(503);
var SWITCHING_PROTOCOLS_Text = HttpStatusCodes.getStatusText(101);
var TEMPORARY_REDIRECT_Text = HttpStatusCodes.getStatusText(307);
var TOO_MANY_REQUESTS_Text = HttpStatusCodes.getStatusText(429);
var UNAUTHORIZED_Text = HttpStatusCodes.getStatusText(401);
var UNPROCESSABLE_ENTITY_Text = HttpStatusCodes.getStatusText(422);
var UNSUPPORTED_MEDIA_TYPE_Text = HttpStatusCodes.getStatusText(415);
var USE_PROXY_Text = HttpStatusCodes.getStatusText(305);
