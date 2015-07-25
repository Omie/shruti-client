FROM scratch
ADD shruti-client /
ADD assets /assets
ADD templates /templates
ADD audiofiles /audiofiles
ENTRYPOINT ["/shruti-client"]
