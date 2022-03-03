<?php
//Define access
define('_VALID', 'Yes');
//required files
require_once('../include/config/config.php');

//variables
$contactFormName = '';
$contactFormEmail = '';
$contactFormSubject = '';
$contactFormMessage = '';
$checkStep = 1;

//Add new message
if (isset($_POST['name'])){ 


        //Get values
        $contactFormName = $_POST['name'];
        $contactFormEmail = $_POST['email'];
        $contactFormSubject = $_POST['subject'];
        $contactFormMessage = $_POST['message'];


        // 1. check name form field
        if($checkStep == 1){
            if($contactFormName === $_POST['name']){
                $contactFormName = filterName($contactFormName);
                $checkStep++;

            }else{
                echo "No its not working";
            }
        }
            // 2. check email field
            if($checkStep == 2){
                if($contactFormEmail === $_POST['email']){
                    $contactFormEmail = filterEmail($contactFormEmail);
                    $checkStep++;
                }else{
                        echo "Uh Oh! Something went wrong with your email please try again!";
                    }
                }

            // 3. check subject
            if($checkStep == 3){
                if($contactFormSubject === $_POST['subject']){
                    $contactFormSubject = filterSubject($contactFormSubject);
                    $checkStep++;
                }else{
                    echo "Uh Oh! Whats up with your subject";
                }
            }
            // 4. check message
            if($checkStep == 4){
                 if($contactFormMessage === $_POST['message']){
                    $contactFormMessage = filterMessage($contactFormMessage);
                     $checkStep++;
                }else{
                    echo "Uh ho!  Please write us a message";
                }
            }
            // 5. insert message
            if($checkStep == 5){
                $sqlAddMessage = "
                    INSERT INTO contact_form(
                        name,
                        email,
                        subject,
                        message
                    ) VALUES(
                        '$contactFormName', 
                        '$contactFormEmail', 
                        '$contactFormSubject', 
                        '$contactFormMessage'
                    )
                ";
                $queryAddMessage = $GLOBALS['mysqli']->query($sqlAddMessage);

                if($queryAddMessage){
                echo "OK";
                //code goes here
                }

